/**
 * Service worker: context-menu verification and surface coordination.
 *
 * Listeners are registered at the top level because a worker woken by an event
 * must have its listener in place before the event is dispatched.
 */

import { loadLocale, matchLocale, t } from './i18n.js';
import { SETTINGS_KEY, loadSettings } from './lib/settings.js';
import { normalizeEmail } from './lib/validation.js';
import { verifyEmail } from './lib/orchestrator.js';

async function refreshContextMenuTitle() {
  const settings = await loadSettings();
  const code = settings.lang ?? matchLocale(chrome.i18n?.getUILanguage?.()) ?? 'en';
  await loadLocale(code);
  chrome.contextMenus.update('mail-aura-verify', { title: t('contextMenuTitle') }, () => {
    void chrome.runtime.lastError;
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'mail-aura-verify',
    title: t('contextMenuTitle'),
    contexts: ['selection', 'link']
  }, () => {
    void chrome.runtime.lastError;
  });
  void refreshContextMenuTitle();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[SETTINGS_KEY]) void refreshContextMenuTitle();
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'mail-aura-verify') return;

  const raw = info.linkUrl?.startsWith('mailto:')
    ? decodeURIComponent(info.linkUrl.slice(7).split(/[?#]/u)[0])
    : (info.selectionText ?? '');

  const parsed = normalizeEmail(raw);
  if (!parsed) return;

  // The context menu is a separate entry point, so it must honour the same
  // privacy flag the user set in the popup before any network call happens.
  const settings = await loadSettings();
  const result = await verifyEmail(parsed.normalized, { privacyMode: settings.privacy });
  await chrome.storage.session.set({ pendingResult: { ...result, at: Date.now() } });
  if (chrome.action?.openPopup) await chrome.action.openPopup();
  else await chrome.sidePanel?.open({ windowId: info.tab?.windowId });
});
