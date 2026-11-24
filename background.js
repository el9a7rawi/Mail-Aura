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

function openFallbackSurface() {
  try { void chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') }); } catch { /* no tab API */ }
}

// Panel APIs are gesture-gated: the call must happen in the same turn as the
// click, before any promise is awaited. The result reaches the surface later
// through storage.session, so ordering the calls this way is safe.
function openResultSurface(tab) {
  try {
    if (chrome.sidePanel?.open && tab?.id) {
      void chrome.sidePanel.open({ tabId: tab.id }).catch(() => openFallbackSurface());
      return;
    }
    if (chrome.sidebarAction?.open) {
      void chrome.sidebarAction.open().catch(() => openFallbackSurface());
      return;
    }
    if (chrome.action?.openPopup) {
      void chrome.action.openPopup().catch(() => openFallbackSurface());
      return;
    }
  } catch {
    // An unavailable API in this browser; use the tab fallback below.
  }
  openFallbackSurface();
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'mail-aura-verify') return;
  openResultSurface(tab);
  void verifyFromContextMenu(info);
});

async function verifyFromContextMenu(info) {
  let raw = info.selectionText ?? '';
  if (info.linkUrl?.startsWith('mailto:')) {
    try {
      raw = decodeURIComponent(info.linkUrl.slice(7).split(/[?#]/u)[0]);
    } catch {
      // A page controls the href, so a stray '%' must not kill the whole action.
      // Keep the selected text (often the visible address) as the fallback.
    }
  }

  const parsed = normalizeEmail(raw);
  if (!parsed) return;

  // The context menu is a separate entry point, so it must honour the same
  // privacy flag the user set in the popup before any network call happens.
  const settings = await loadSettings();
  const result = await verifyEmail(parsed.normalized, { privacyMode: settings.privacy });
  await chrome.storage.session.set({ pendingResult: { ...result, at: Date.now() } });
}
