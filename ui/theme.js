/**
 * Theme controller.
 *
 * MV3 forbids inline scripts, so the stored preference cannot be applied before
 * the first paint. The neutral light default keeps that flash predictable; the
 * switch happens as soon as this module loads.
 */

const STORAGE_KEY = 'theme';
const DARK = 'dark';
const LIGHT = 'light';

export function applyTheme(theme, translate = (key) => key) {
  const dark = theme === DARK;
  document.body.dataset.theme = dark ? DARK : LIGHT;

  document.querySelectorAll('.theme-moon').forEach((node) => node.toggleAttribute('hidden', dark));
  document.querySelectorAll('.theme-sun').forEach((node) => node.toggleAttribute('hidden', !dark));

  const button = document.getElementById('themeToggle');
  if (button) {
    const label = dark ? translate('themeToLight') : translate('themeToDark');
    button.setAttribute('aria-label', label);
    button.title = label;
    button.setAttribute('aria-pressed', String(dark));
  }
  return dark ? DARK : LIGHT;
}

export async function loadTheme() {
  try {
    const stored = await chrome.storage.local.get([STORAGE_KEY]);
    return stored[STORAGE_KEY] === DARK ? DARK : LIGHT;
  } catch {
    return LIGHT;
  }
}

export async function saveTheme(theme) {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: theme });
  } catch {
    // A blocked storage write must not break the toggle for the current session.
  }
}
