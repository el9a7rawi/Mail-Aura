# Bundled fonts

These WOFF2 files are bundled with the extension so the interface matches CopyTabs without any runtime network request:

- **Inter** (Latin, Cyrillic) — variable 400–800
- **Cairo** (Latin, Arabic) — variable 400–800
- **Tajawal** (Latin, Arabic) — 400, 500, 700

They are redistributed under the SIL Open Font License 1.1. The full license text and the copyright notices for all three families are in `OFL.txt`, which ships with the extension.

`ui.css` declares the `@font-face` rules and `manifest.json` restricts `font-src` to `'self'`.
