/**
 * Shared settings access for both the UI surfaces and the service worker.
 *
 * A single reader keeps the privacy flag consistent across every entry point;
 * two independent readers would let the context menu ignore a setting the user
 * just enabled in the popup.
 */

import { LOCALES } from '../i18n.js';

export const SETTINGS_KEY = 'mailAuraSettings';

export const DEFAULT_SETTINGS = Object.freeze({
  lang: null,
  mode: 'page',
  privacy: false,
  highlight: true,
  showSources: false,
  autoFix: false,
  filter: 'all'
});

export const MODES = new Set(['page', 'manual', 'file']);
export const FILTERS = new Set(['all', 'valid', 'corrected', 'invalid', 'suspicious', 'review', 'unknown']);

export async function loadSettings(storage = globalThis.chrome?.storage?.local) {
  if (!storage) return { ...DEFAULT_SETTINGS };

  try {
    const stored = await storage.get([SETTINGS_KEY, 'privacy', 'privacyMode', 'lang']);
    const saved = stored[SETTINGS_KEY] ?? {};
    const merged = { ...DEFAULT_SETTINGS, ...saved };

    // A side panel can be discarded while an async settings write is in flight.
    // The dedicated key is written synchronously alongside the object so a
    // language choice still survives a quick close/reopen.
    if (merged.lang === null && LOCALES.some((locale) => locale.code === stored.lang)) {
      merged.lang = stored.lang;
    }

    // Earlier versions stored the flag under a flat key.
    if (saved.privacy === undefined && (stored.privacy ?? stored.privacyMode) === true) {
      merged.privacy = true;
    }
    if (!MODES.has(merged.mode)) merged.mode = DEFAULT_SETTINGS.mode;
    if (!FILTERS.has(merged.filter)) merged.filter = DEFAULT_SETTINGS.filter;
    if (merged.lang !== null && !LOCALES.some((locale) => locale.code === merged.lang)) {
      merged.lang = DEFAULT_SETTINGS.lang;
    }
    return merged;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings, storage = globalThis.chrome?.storage?.local) {
  if (!storage) return;
  try {
    await storage.set({ [SETTINGS_KEY]: settings });
  } catch {
    // A failed write must not block the action the user just requested.
  }
}
