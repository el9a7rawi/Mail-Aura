<p align="center">
  <img src="assets/banner/mail-aura-banner-en.webp" width="100%" alt="Mail Aura — Email Verifier &amp; List Cleaner" />
</p>

<h1 align="center">Mail Aura — Email Verifier & List Cleaner</h1>

<p align="center">Verify email addresses with eight free public sources, clean long lists in one click, and export the results as CSV — no API keys, no account, no guesswork. Eight interface languages are bundled, including full Arabic RTL.</p>

<p align="center">
  <a href="https://github.com/el9a7rawi/Mail-Aura/releases"><img src="https://img.shields.io/github/v/release/el9a7rawi/Mail-Aura?color=4f46e5" alt="Latest release" /></a>
  <a href="https://github.com/el9a7rawi/Mail-Aura/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-E8710A" alt="Apache 2.0" /></a>
  <a href="https://github.com/el9a7rawi/Mail-Aura/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-22C55E" alt="PRs welcome" /></a>
  <a href="https://developer.chrome.com/docs/extensions"><img src="https://img.shields.io/badge/Manifest-V3-4285F4" alt="Manifest V3" /></a>
  <img src="https://img.shields.io/badge/8_Languages-7c3aed" alt="8 languages" />
  <img src="https://img.shields.io/badge/No_API_Keys-059669" alt="No API keys" />
</p>

<h4 align="center">
  <a href="README.md"><b>English</b></a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · <a href="README.de.md">Deutsch</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.zh-CN.md">中文（简体）</a>
</h4>

<h3 align="center">Download for your browser — click the icon</h3>

<div align="center">

| [<img src="assets/browsers/chrome.svg" width="52" alt="Chrome" /><br><b>Chrome</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/edge.svg" width="52" alt="Edge" /><br><b>Edge</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/firefox.svg" width="52" alt="Firefox" /><br><b>Firefox</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/brave.svg" width="52" alt="Brave" /><br><b>Brave</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/opera.svg" width="52" alt="Opera" /><br><b>Opera</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) |
|---|---|---|---|---|

</div>

Chrome and Chromium browsers are the primary target. Firefox is supported from version 140 through a dedicated archive with a Firefox-specific manifest (sidebar action and a classic background script).

---

## 1. Why Mail Aura?

<div align="center">

| Without Mail Aura | With Mail Aura |
|---|---|
| Guess from format alone | Eight independent sources plus local signals |
| Pasted lists full of duplicates | Duplicates removed before verification |
| Manual CSV cleanup | One-click CSV import and export |
| A 100% badge that means nothing | An honest score capped at 88% for valid addresses |

</div>

No public service can prove that a specific mailbox exists without sending an actual email. Mail Aura therefore reports a **confidence score**, not a guarantee.

---

## 2. How it works — three steps

1. **Choose a source** — scan the current page, paste a list, or load a CSV.
2. **Verify** — addresses are checked in parallel against eight free services and cached by domain.
3. **Act** — copy the valid addresses, correct typos with one click, or export everything as CSV.

---

## 3. Interface tour — every part of the extension

### 3.1 Header — everything in reach
<p align="center"><img src="assets/screenshots/en/sections/section-header.webp" width="400" alt="Header" /></p>

The title, language picker, theme toggle, GitHub link, and side-panel button sit in one compact row.

### 3.2 One primary action
<p align="center"><img src="assets/screenshots/en/sections/section-hero.webp" width="400" alt="Primary action" /></p>

A single gradient button does the work for the active source. Under it, **Copy valid** and **Export CSV** are one click away; the results toolbar also offers **Copy shown results**, **Clear results**, and a copy button on each row. The status line tells you exactly what happened.

### 3.3 Source — current page
<p align="center"><img src="assets/screenshots/en/sections/section-source.webp" width="400" alt="Page source" /></p>

Scan only the addresses visible on the page you are reading. Nothing is read until you press the button.

### 3.4 Source — pasted list
<p align="center"><img src="assets/screenshots/en/sections/section-manual.webp" width="400" alt="Manual input" /></p>

Paste one address per line or separate with commas. Duplicates disappear before verification, malformed lines stay visible as results.

### 3.5 Source — CSV file
<p align="center"><img src="assets/screenshots/en/sections/section-file.webp" width="400" alt="CSV picker" /></p>

A file card shows the icon and selected filename. Only the first column is read, so messy exports still work.

### 3.6 Results — the core of the product
<p align="center"><img src="assets/screenshots/en/sections/section-results.webp" width="400" alt="Results list" /></p>

Each row shows the address, a colour-coded status badge, one reason line, and per-row actions. Optional source chips show identifiers for the sources that actually answered.

### 3.7 Filter and search
<p align="center"><img src="assets/screenshots/en/sections/section-filtersearch.webp" width="400" alt="Filter and live search" /></p>

Seven filter states and an expanding search field work together; an 80ms debounce keeps typing smooth.

### 3.8 Context-menu verification

Select an email address or a `mailto:` link on any page, then choose **Verify this email address**. The result opens in the popup and respects Privacy mode, so no external call happens when it is enabled.

### 3.9 Settings
<p align="center"><img src="assets/screenshots/en/sections/section-options.webp" width="400" alt="Settings" /></p>

Privacy mode, page highlighting, source chips, and optional CSV auto-correction are explicit switches. Auto-correction is off by default and only rewrites known domain typos in uploaded CSVs; unknown typos are never guessed. Toggling Privacy mode also clears the in-memory domain cache.

### 3.10 Eight languages, real RTL
<p align="center"><img src="assets/screenshots/en/sections/section-language.webp" width="220" alt="Language menu" /></p>

Switch instantly between English, Español, Français, Deutsch, Português (Brasil), Русский, العربية, and 中文（简体）. Arabic flips the whole layout logically, not cosmetically.

### 3.11 True black dark theme
<p align="center"><img src="assets/screenshots/en/popup-dark.webp" width="280" alt="Mail Aura popup — dark theme" /></p>

A real black background with tuned contrast, toggled from the header and remembered between sessions.

### 3.12 Side panel for long lists
<p align="center"><img src="assets/screenshots/en/sections/section-side.webp" width="320" alt="Side panel" /></p>

The same controller, a wider canvas, and one scroll container — no nested scrollbars.

### 3.13 Empty state
<p align="center"><img src="assets/screenshots/en/sections/section-empty.webp" width="400" alt="Empty state" /></p>

An honest invite to scan or paste, never a blank box.

### 3.14 Support continued development
<p align="center"><img src="assets/screenshots/en/sections/section-donate.webp" width="400" alt="Support section" /></p>

Mail Aura is free and open source. PayPal and a highlighted InstaPay option help keep it improving. Both open in a new tab; the extension sends no data.

---

## 4. Eight free sources

1. Rapid Email Validator
2. Disify
3. DeBounce
4. MailCheck.ai
5. Disban
6. EmailProbe
7. Google DNS-over-HTTPS
8. Cloudflare DNS-over-HTTPS

All calls are HTTPS and keyless. Privacy mode disables them all. Unicode/IDN addresses are rejected locally; punycode is not supported in this release.

---

## 5. Install (unpacked)

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Click the Mail Aura icon in the toolbar.

Privacy is covered in section 7 below and in `privacy.html`.

---

## 6. Development

The published repository contains the extension and its documentation only. Development fixtures, helper scripts and the local test suite are intentionally kept out of the repository; GitHub Actions validates the manifest, CSP, locale coverage and bundled assets on every push.

---

## 7. Privacy

See `privacy.html`. Addresses are sent only when you request a check, nothing is tracked, and all connections use HTTPS. A context-menu result is held briefly in session storage until the popup reads it, settings stay in local storage, and domain results are cached in memory only. Fonts are bundled locally; no font request leaves the extension.

---

## 8. License

The project is open source and free for everyone under the **Apache-2.0** license — use it, modify it, and share it freely; the full text is in [LICENSE](LICENSE). Bundled fonts are licensed separately under [SIL OFL 1.1](fonts/OFL.txt). See [CHANGELOG.md](CHANGELOG.md) for the release history.

---

<p align="center">Built with care by <b>Ahmed Yousry</b> · <a href="https://github.com/el9a7rawi/Mail-Aura">Mail Aura</a> · <a href="LICENSE">Apache-2.0</a></p>
