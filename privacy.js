// The privacy page shares the extension theme and locale with the popup, but
// MV3 forbids inline scripts, so the bootstrap lives in this external module.
import { applyTheme, loadTheme } from './ui/theme.js';
import { loadLocale } from './i18n.js';
import { loadSettings } from './lib/settings.js';

const [theme, settings] = await Promise.all([loadTheme(), loadSettings()]);
applyTheme(theme);
await loadLocale(settings.lang ?? 'en');
