/**
 * Popup and side-panel controller.
 *
 * The same document powers both surfaces, so every query guards against a
 * missing node: the side panel intentionally omits the popup-only action.
 * Addresses are untrusted input and are written through textContent only.
 */

import { autoFixEmails } from './lib/autofix.js';
import { CSV_MAX_BYTES, csvEmails, csvEscape, csvResultRows } from './lib/csv.js';
import { DEFAULT_SETTINGS, SETTINGS_KEY, loadSettings, saveSettings } from './lib/settings.js';
import { applyTranslations, localeCode, loadLocale, matchLocale, t } from './i18n.js';
import { parseEmailLines } from './lib/validation.js';
import { clearDomainCache, verifyBatch, verifyEmail } from './lib/orchestrator.js';
import { createResultRow } from './ui/result-row.js';
import { applyTheme, loadTheme, saveTheme } from './ui/theme.js';
import {
  closeAllMenus,
  enhanceCustomSelects,
  refreshCustomSelects,
  syncCustomSelects
} from './ui/cselect.js';

const GOOD = new Set(['valid', 'corrected']);

const $ = (id) => document.getElementById(id);

const els = {
  statusMsg: $('statusMsg'),
  mainAction: $('mainAction'),
  mainActionTitle: $('mainActionTitle'),
  mainActionHint: $('mainActionHint'),
  copyValid: $('copyValid'),
  exportCsv: $('exportCsv'),
  themeToggle: $('themeToggle'),
  openPanel: $('openPanel'),
  mode: $('mode'),
  manual: $('manualInput'),
  manualCount: $('manualCount'),
  clearManual: $('clearManual'),
  fileInput: $('fileInput'),
  fileName: $('fileName'),
  fileRow: $('fileRow'),
  pickFile: $('pickFile'),
  list: $('resultsList'),
  resultsAnnounce: $('resultsAnnounce'),
  empty: $('resultsEmpty'),
  resultCount: $('resultCount'),
  filter: $('filter'),
  searchToggle: $('searchToggle'),
  searchInput: $('searchInput'),
  searchClear: $('searchClear'),
  lang: $('lang'),
  copyVisible: $('copyVisible'),
  clearResults: $('clearResults'),
  privacyMode: $('privacyMode'),
  highlightPage: $('highlightPage'),
  showSources: $('showSources'),
  autoFix: $('autoFix'),
  resetOptions: $('resetOptions')
};

let settings = { ...DEFAULT_SETTINGS };
let theme = 'light';
let results = [];
let query = '';
let busy = false;
let searchTimer = 0;
// Invalidated by "clear results" or a source switch so a late batch cannot
// repopulate results the user has already discarded.
let scanToken = 0;

/* ---------- Source / hero ---------- */

function parsedManual() {
  return parseEmailLines(els.manual.value);
}

function fromParsed(parsed) {
  return [...parsed.emails, ...parsed.invalid];
}

function showPane(mode) {
  document.querySelectorAll('[data-pane]').forEach((pane) => {
    pane.hidden = pane.dataset.pane !== mode;
  });
  updateHero();
}

function updateHero() {
  if (busy) {
    els.mainActionTitle.textContent = t('actionBusy');
    els.mainActionHint.textContent = t('actionBusyHint');
    return;
  }

  if (settings.mode === 'manual') {
    const parsed = parsedManual();
    const count = parsed.emails.length + parsed.invalid.length;
    els.mainActionTitle.textContent = t('actionManual');
    els.mainActionHint.textContent = count
      ? t('actionManualReady', { n: count })
      : t('actionManualTip');
    return;
  }

  if (settings.mode === 'file') {
    const file = els.fileInput.files?.[0];
    els.mainActionTitle.textContent = t('actionFile');
    els.mainActionHint.textContent = file ? file.name : t('fileHint');
    return;
  }

  els.mainActionTitle.textContent = t('actionScan');
  els.mainActionHint.textContent = t('actionScanHint');
}

function updateManualCount() {
  const parsed = parsedManual();
  const count = parsed.emails.length + parsed.invalid.length;
  els.manualCount.textContent = t('manualCount', { n: count });
}

/* ---------- Status / busy ---------- */

function setStatus(message, kind = '') {
  els.statusMsg.textContent = message;
  els.statusMsg.classList.toggle('error', kind === 'error');
  els.statusMsg.classList.toggle('busy', kind === 'busy');
}

function setBusy(on) {
  busy = on;
  els.mainAction.disabled = on;
  updateHero();
}

function showSkeleton() {
  els.empty.hidden = true;
  els.resultCount.textContent = '';
  els.list.replaceChildren();
  for (let index = 0; index < 3; index += 1) {
    const item = document.createElement('li');
    item.className = 'skeleton';
    item.setAttribute('aria-hidden', 'true');
    els.list.appendChild(item);
  }
}

/* ---------- Results ---------- */

function visibleResults() {
  const needle = query.trim().toLowerCase();
  return results.filter((result) => {
    const status = result.confidence.status;
    if (settings.filter !== 'all' && status !== settings.filter) return false;
    return !needle || result.email.toLowerCase().includes(needle);
  });
}

function render() {
  const visible = visibleResults();
  els.resultCount.textContent = results.length ? `(${visible.length})` : '';
  if (els.resultsAnnounce) {
    els.resultsAnnounce.textContent = results.length
      ? t('resultCountAnnounce', { n: visible.length })
      : '';
  }

  els.list.replaceChildren(...visible.map((result) => createResultRow(result, {
    showSources: settings.showSources,
    onCopy: copyOne,
    onFix: applyFix,
    t
  })));

  const noResults = results.length === 0;
  const noMatch = results.length > 0 && visible.length === 0;
  els.empty.hidden = !noResults && !noMatch;
  if (!els.empty.hidden) {
    els.empty.querySelector('strong').textContent = noMatch
      ? t('emptyNoMatchTitle')
      : t('emptyTitle');
    els.empty.querySelector('span').textContent = noMatch
      ? t('emptyNoMatchHint')
      : t('emptyHint');
  }
}

function summarize() {
  const counts = results.reduce((map, result) => {
    const status = result.confidence.status;
    map[status] = (map[status] ?? 0) + 1;
    return map;
  }, {});

  const parts = [];
  if (counts.valid) parts.push(t('countValid', { n: counts.valid }));
  if (counts.corrected) parts.push(t('countCorrected', { n: counts.corrected }));
  if (counts.invalid) parts.push(t('countInvalid', { n: counts.invalid }));
  if (counts.suspicious) parts.push(t('countSuspicious', { n: counts.suspicious }));
  if (counts.review) parts.push(t('countReview', { n: counts.review }));
  if (counts.unknown) parts.push(t('countUnknown', { n: counts.unknown }));

  return t('statusSummary', { n: results.length, parts: parts.join(' · ') });
}

function duplicatesNote(duplicates) {
  return duplicates.length ? t('statusDuplicateNote', { n: duplicates.length }) : '';
}

async function verifyList(emails, note = '', token = scanToken, correctedFrom = []) {
  showSkeleton();
  setStatus(t('statusVerifying', { n: emails.length }), 'busy');
  try {
    const batch = await verifyBatch(emails, {
      privacyMode: settings.privacy,
      concurrency: 4,
      correctedFrom
    });
    if (token !== scanToken) return;
    results = batch;
    render();
    setStatus(`${summarize()}${note}`);
  } catch {
    if (token !== scanToken) return;
    results = [];
    render();
    setStatus(t('statusVerificationFailed'), 'error');
  }
}

/* ---------- Actions ---------- */

async function handleMainAction() {
  if (busy) return;
  // Claim the busy state before the first await: file reads and tab messages
  // are asynchronous, and two quick clicks must not start two batches.
  setBusy(true);
  const token = ++scanToken;
  try {
    if (settings.mode === 'manual') await checkManual(token);
    else if (settings.mode === 'file') await checkFile(token);
    else await scanPage(token);
  } finally {
    setBusy(false);
  }
}

async function scanPage(token) {
  setStatus(t('statusScanning'), 'busy');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('no active tab');

    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, {
        type: 'SCAN_PAGE',
        highlight: settings.highlight
      });
    } catch {
      // The content script is injected on demand so the manifest stays free of
      // a broad host permission.
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      response = await chrome.tabs.sendMessage(tab.id, {
        type: 'SCAN_PAGE',
        highlight: settings.highlight
      });
    }

    const emails = Array.isArray(response?.emails) ? response.emails : [];
    if (!emails.length) {
      results = [];
      render();
      setStatus(t('statusNoEmails'));
      return;
    }
    await verifyList(emails, '', token);
  } catch {
    setStatus(t('statusScanFailed'), 'error');
  }
}

async function checkManual(token) {
  const parsed = parsedManual();
  const list = fromParsed(parsed);
  if (!list.length) {
    setStatus(t('statusNeedManual'), 'error');
    return;
  }
  await verifyList(list, duplicatesNote(parsed.duplicates), token);
}

async function checkFile(token) {
  const file = els.fileInput.files?.[0];
  if (!file) {
    setStatus(t('statusNeedFile'), 'error');
    return;
  }
  if (file.size > CSV_MAX_BYTES) {
    setStatus(t('statusFileTooLarge'), 'error');
    return;
  }

  const parsed = parseEmailLines(csvEmails(await file.text()).join('\n'));
  let list = fromParsed(parsed);
  let note = duplicatesNote(parsed.duplicates);
  let correctedFrom = [];

  if (settings.autoFix) {
    const fixed = autoFixEmails(list);
    list = fixed.emails;
    correctedFrom = fixed.correctedFrom;
    if (fixed.corrections) {
      const applied = t('statusAutoFixed', { n: fixed.corrections });
      note = note ? `${note} ${applied}` : applied;
    }
  }

  if (!list.length) {
    setStatus(t('statusFileEmpty'), 'error');
    return;
  }

  await verifyList(list, note, token, correctedFrom);
}

async function applyFix(result) {
  const suggestion = result.local?.suggestion;
  if (!suggestion || busy) return;

  setBusy(true);
  setStatus(t('statusFixing', { address: suggestion }), 'busy');
  try {
    const fixed = await verifyEmail(suggestion, { privacyMode: settings.privacy });
    // Match by address rather than object identity: a concurrent render may
    // have replaced the row object while the network call was in flight.
    const index = results.findIndex((item) => item.email === result.email);
    if (index >= 0) results[index] = fixed;
    render();
    setStatus(t('statusFixed', {
      address: fixed.email,
      status: t(`status${fixed.confidence.status.charAt(0).toUpperCase()}${fixed.confidence.status.slice(1)}`)
    }));
  } catch {
    setStatus(t('statusFixFailed'), 'error');
  } finally {
    setBusy(false);
  }
}

/* ---------- Clipboard / export ---------- */

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    try {
      area.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }
}

async function copyOne(result) {
  const ok = await copyText(result.email);
  setStatus(ok ? t('statusCopiedOne', { address: result.email }) : t('statusCopyFailed'), ok ? '' : 'error');
}

async function copyValid() {
  const emails = results.filter((result) => GOOD.has(result.confidence.status)).map((result) => result.email);
  if (!emails.length) {
    setStatus(t('statusNoValidToCopy'), 'error');
    return;
  }
  const ok = await copyText(emails.join('\n'));
  setStatus(ok ? t('statusCopiedValid', { n: emails.length }) : t('statusCopyFailed'), ok ? '' : 'error');
}

async function copyVisible() {
  const emails = visibleResults().map((result) => result.email);
  if (!emails.length) {
    setStatus(t('statusNoVisibleToCopy'), 'error');
    return;
  }
  const ok = await copyText(emails.join('\n'));
  setStatus(ok ? t('statusCopiedVisible', { n: emails.length }) : t('statusCopyFailed'), ok ? '' : 'error');
}

function exportCsv() {
  if (!results.length) {
    setStatus(t('statusNoExport'), 'error');
    return;
  }

  const head = ['Email', 'Status', 'Estimate', 'Agreement', 'Suggestion', 'Sources'];
  const rows = csvResultRows(results);

  const csv = `\uFEFF${[head, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `mail-aura-${stamp}.csv`;
  link.click();
  // Revoking in the same tick can cancel the download before Chrome reads the blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus(t('statusExported', { n: results.length }));
}

/* ---------- Side panel ---------- */

async function openSidePanel() {
  try {
    const win = await chrome.windows.getCurrent();
    await chrome.sidePanel.open({ windowId: win.id });
    window.close();
  } catch {
    setStatus(t('statusPanelError'), 'error');
  }
}

/* ---------- Search ---------- */

function expandSearch() {
  const box = els.searchToggle.closest('.searchbox');
  box.classList.add('open');
  els.searchToggle.setAttribute('aria-expanded', 'true');
  els.searchInput.removeAttribute('aria-hidden');
  els.searchInput.tabIndex = 0;
  els.searchInput.focus();
}

function collapseSearch() {
  const box = els.searchToggle.closest('.searchbox');
  box.classList.remove('open');
  els.searchToggle.setAttribute('aria-expanded', 'false');
  els.searchInput.value = '';
  els.searchInput.setAttribute('aria-hidden', 'true');
  els.searchInput.tabIndex = -1;
  els.searchClear.hidden = true;
  query = '';
  render();
  els.searchToggle.focus();
}

/* ---------- Init ---------- */

function applySettingsToUI() {
  els.mode.value = settings.mode;
  els.filter.value = settings.filter;
  els.privacyMode.checked = settings.privacy;
  els.highlightPage.checked = settings.highlight;
  els.showSources.checked = settings.showSources;
  els.autoFix.checked = settings.autoFix;

  syncCustomSelects();
  showPane(settings.mode);
  updateManualCount();
}

function bindEvents() {
  els.mainAction.addEventListener('click', handleMainAction);
  els.copyValid.addEventListener('click', copyValid);
  els.exportCsv.addEventListener('click', exportCsv);

  els.themeToggle.addEventListener('click', async () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme, t);
    await saveTheme(theme);
  });
  els.openPanel?.addEventListener('click', openSidePanel);

  els.lang?.addEventListener('change', async () => {
    settings.lang = els.lang.value;
    await saveSettings(settings);
    await loadLocale(settings.lang);
    applyTranslations(document);
    refreshCustomSelects();
    applySettingsToUI();
    render();
  });

  els.mode.addEventListener('change', () => {
    if (busy) {
      // Results belong to the scan that produced them; switching sources while
      // it runs would describe one source with another source's results.
      els.mode.value = settings.mode;
      syncCustomSelects();
      return;
    }
    settings.mode = els.mode.value;
    scanToken += 1;
    saveSettings(settings);
    showPane(settings.mode);
  });

  els.filter.addEventListener('change', () => {
    settings.filter = els.filter.value;
    saveSettings(settings);
    render();
  });

  els.manual.addEventListener('input', () => {
    updateManualCount();
    updateHero();
  });
  els.clearManual.addEventListener('click', () => {
    els.manual.value = '';
    updateManualCount();
    updateHero();
    els.manual.focus();
  });

  els.pickFile.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', () => {
    const file = els.fileInput.files?.[0];
    els.fileName.textContent = file?.name ?? t('fileNone');
    els.fileRow.classList.toggle('has-file', Boolean(file));
    updateHero();
  });

  els.privacyMode.addEventListener('change', () => {
    settings.privacy = els.privacyMode.checked;
    clearDomainCache();
    saveSettings(settings);
    setStatus(settings.privacy
      ? t('connectionPrivate')
      : t('connectionOnline'));
  });

  els.highlightPage.addEventListener('change', async () => {
    settings.highlight = els.highlightPage.checked;
    saveSettings(settings);
    if (settings.highlight) return;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) await chrome.tabs.sendMessage(tab.id, { type: 'CLEAR_HIGHLIGHT' });
    } catch {
      // No scannable page is a normal state, not an error worth reporting.
    }
  });

  els.showSources.addEventListener('change', () => {
    settings.showSources = els.showSources.checked;
    saveSettings(settings);
    render();
  });

  els.autoFix.addEventListener('change', () => {
    settings.autoFix = els.autoFix.checked;
    saveSettings(settings);
  });

  els.resetOptions.addEventListener('click', async () => {
    settings = { ...DEFAULT_SETTINGS, mode: settings.mode };
    await saveSettings(settings);
    applySettingsToUI();
    render();
    setStatus(t('statusReset'));
  });

  els.searchToggle.addEventListener('click', () => {
    const box = els.searchToggle.closest('.searchbox');
    box.classList.contains('open') ? collapseSearch() : expandSearch();
  });
  els.searchInput.addEventListener('input', () => {
    els.searchClear.hidden = !els.searchInput.value;
    query = els.searchInput.value;
    // Debounce so typing does not rebuild every result row on each keystroke.
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 80);
  });
  els.searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') collapseSearch();
  });
  els.searchClear.addEventListener('click', () => {
    clearTimeout(searchTimer);
    els.searchInput.value = '';
    els.searchClear.hidden = true;
    query = '';
    render();
    els.searchInput.focus();
  });

  els.copyVisible.addEventListener('click', copyVisible);
  els.clearResults.addEventListener('click', () => {
    scanToken += 1;
    results = [];
    clearDomainCache();
    render();
    setStatus('');
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.cselect')) closeAllMenus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllMenus();
  });
}

async function pendingResult() {
  try {
    if (!chrome.storage?.session) return;
    const data = await chrome.storage.session.get('pendingResult');
    if (!data.pendingResult) return;
    await chrome.storage.session.remove('pendingResult');

    // A result left behind by an old context-menu click must not appear later.
    const { at, ...result } = data.pendingResult;
    if (typeof at === 'number' && Date.now() - at > 60_000) return;
    results = [result];
    render();
    setStatus(t('statusContextResult'));
  } catch {
    // Session storage is best-effort; the popup still opens normally without it.
  }
}

function syncWebFonts() {
  const id = 'mail-aura-fonts';
  document.getElementById(id)?.remove();
  if (settings.privacy) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700&display=swap';
  document.head.appendChild(link);
}

function bindStorageSync() {
  chrome.storage?.onChanged?.addListener(async (changes, area) => {
    if (area === 'local' && changes[SETTINGS_KEY]) {
      settings = { ...DEFAULT_SETTINGS, ...(changes[SETTINGS_KEY].newValue ?? {}) };
      syncWebFonts();
      if (changes[SETTINGS_KEY].newValue?.lang && changes[SETTINGS_KEY].newValue.lang !== localeCode()) {
        await loadLocale(settings.lang);
        applyTranslations(document);
        refreshCustomSelects();
      }
      applySettingsToUI();
      render();
    }
    if (area === 'local' && changes.theme) {
      theme = changes.theme.newValue === 'dark' ? 'dark' : 'light';
      applyTheme(theme, t);
    }
    if (area === 'session' && changes.pendingResult) void pendingResult();
  });
}

async function init() {
  settings = await loadSettings();
  if (settings.lang === null) {
    settings.lang = matchLocale(globalThis.navigator?.language) ?? 'en';
    await saveSettings(settings);
  }

  syncWebFonts();
  theme = await loadTheme();
  await loadLocale(settings.lang);
  applyTheme(theme, t);

  enhanceCustomSelects();
  applyTranslations(document);
  refreshCustomSelects();
  applySettingsToUI();

  bindEvents();
  bindStorageSync();
  render();
  await pendingResult();
}

await init();
