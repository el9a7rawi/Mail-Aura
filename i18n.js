/**
 * Interface internationalisation.
 *
 * Dictionaries ship with the extension and are loaded on demand, so switching
 * language performs no network request and needs no rebuild step.
 */

export const LOCALES = Object.freeze([
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', dir: 'ltr' },
  { code: 'pt-BR', label: 'Português (Brasil)', dir: 'ltr' },
  { code: 'ru', label: 'Русский', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'zh-CN', label: '中文（简体）', dir: 'ltr' }
]);

const RTL_CODES = new Set(['ar', 'he', 'fa', 'ur']);

let dictionary = {};
let fallbackDictionary = {};
let activeCode = 'en';
let pluralRules = new Intl.PluralRules('en');
let fallbackRules = new Intl.PluralRules('en');

export function localeCode() {
  return activeCode;
}

export function localeDir(code = activeCode) {
  return RTL_CODES.has(code) ? 'rtl' : 'ltr';
}

/** Map a browser language tag to the nearest shipped locale (exact match, then base language). */
export function matchLocale(tag) {
  const raw = String(tag ?? '').trim().toLowerCase();
  if (!raw) return null;
  const exact = LOCALES.find((locale) => locale.code.toLowerCase() === raw);
  if (exact) return exact.code;
  const base = raw.split('-')[0];
  const byBase = LOCALES.find((locale) => locale.code.toLowerCase().split('-')[0] === base);
  return byBase ? byBase.code : null;
}

export function setDirection(dir) {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = dir;
  document.documentElement.lang = activeCode;
}

function localeUrl(code) {
  if (globalThis.chrome?.runtime?.getURL) return chrome.runtime.getURL(`locales/${code}.json`);
  return new URL(`./locales/${code}.json`, import.meta.url).href;
}

async function fetchLocale(code) {
  const response = await fetch(localeUrl(code));
  if (!response.ok) throw new Error(`locale ${code}: HTTP ${response.status}`);
  return response.json();
}

/** Nested locale objects are flattened so callers use dotted keys. */
function flatten(source, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(source)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') flatten(value, name, out);
    else out[name] = value;
  }
  return out;
}

export async function loadLocale(code, dictionaries) {
  const target = LOCALES.some((locale) => locale.code === code) ? code : 'en';
  const read = (name) => dictionaries?.[name] ?? fetchLocale(name);
  const [targetDict, fallbackDict] = await Promise.all([
    read(target),
    target === 'en' ? Promise.resolve({}) : read('en')
  ]);

  dictionary = flatten(targetDict);
  fallbackDictionary = flatten(fallbackDict);
  activeCode = target;
  pluralRules = new Intl.PluralRules(target);
  fallbackRules = new Intl.PluralRules('en');
  setDirection(localeDir(target));
  return target;
}

function lookup(dict, rules, key, vars) {
  if (dict[key] !== undefined) return dict[key];
  if (vars && typeof vars.n === 'number') {
    const category = rules.select(vars.n);
    if (dict[`${key}.${category}`] !== undefined) return dict[`${key}.${category}`];
    if (dict[`${key}.other`] !== undefined) return dict[`${key}.other`];
  }
  return undefined;
}

function interpolate(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/gu, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

export function t(key, vars) {
  const value = lookup(dictionary, pluralRules, key, vars)
    ?? lookup(fallbackDictionary, fallbackRules, key, vars);
  return value === undefined ? key : interpolate(value, vars);
}

export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
    // Translated text must be pronounced with the active locale's voice; the
    // native <option>s otherwise keep their hardcoded lang="en".
    node.lang = localeCode();
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((node) => {
    node.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      if (attr && key) node.setAttribute(attr.trim(), t(key.trim()));
    });
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
}
