<p align="center">
  <img src="icons/icon-128.png" width="96" alt="Mail Aura" />
</p>

<h1 align="center">Mail Aura — Email Verifier & List Cleaner</h1>

<p align="center">Verify email addresses against eight free public sources, clean long lists in one click, and export the results as CSV — without an API key, an account, or guesswork. Eight interface languages are bundled, including full Arabic RTL.</p>

<p align="center">
  <a href="https://github.com/el9a7rawi/Mail-Aura/releases"><img src="https://img.shields.io/github/v/release/el9a7rawi/Mail-Aura?color=4f46e5" alt="Latest release" /></a>
  <a href="https://github.com/el9a7rawi/Mail-Aura/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-E8710A" alt="Apache 2.0" /></a>
  <a href="https://github.com/el9a7rawi/Mail-Aura/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-22C55E" alt="PRs welcome" /></a>
  <a href="https://developer.chrome.com/docs/extensions"><img src="https://img.shields.io/badge/Manifest-V3-4285F4" alt="Manifest V3" /></a>
  <img src="https://img.shields.io/badge/8_Languages-7c3aed" alt="8 languages" />
  <img src="https://img.shields.io/badge/Works-Offline-059669" alt="Works offline" />
</p>

<p align="center">
  <sub><b>Languages:</b> <a href="README.md"><b>English</b></a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · <a href="README.de.md">Deutsch</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.zh-CN.md">中文（简体）</a></sub>
</p>

<p align="center">
  <img src="dev/preview-light.png" width="280" alt="Mail Aura popup — light theme" />
  <img src="dev/preview-dark.png" width="280" alt="Mail Aura popup — dark theme" />
</p>

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

## 3. Interface tour

### 3.1 One primary action, three input modes
- **Scan This Page** — collects visible addresses and highlights them without reading the page beforehand.
- **Paste addresses** — one per line or comma-separated; duplicates are removed and invalid syntax is shown as a result.
- **CSV file** — reads the first column and exports a new CSV with status, confidence, agreement, suggestion, and source details.

### 3.2 Results you can trust
- Each row shows the address, a status badge, and one short detail line: `Confidence N% · reason`.
- Filter by status, search within results, and copy valid or visible rows.
- Correct known domain typos such as `gmial.com → gmail.com` with a single click.
- Disposable domains, role addresses, and free providers are flagged rather than hidden.

### 3.3 Privacy mode
- Stops every external call instantly; verification becomes local-only.
- The connection indicator in the footer always shows the current state.

### 3.4 Eight languages, real RTL
- English is the default; the browser language is used on the first run when it is one of the eight.
- Switching is instant and needs no reload.
- Arabic uses full RTL layout with correct plural rules.

### 3.5 True black dark theme
- A real black background with tuned contrast, toggled from the header and remembered.

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

All calls are HTTPS and keyless. Privacy mode disables them all.

---

## 5. Install (unpacked)

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Click the Mail Aura icon in the toolbar.

No build step and no external dependencies are required.

---

## 6. Development

```powershell
node --test tests/             # 49 unit tests
node --check ui.js             # syntax check for every JS file
node scripts/check-ui.mjs      # DOM ids, manifest files, CSP, HTTPS
node scripts/build-preview.mjs # regenerate dev/preview.html and preview-side.html
```

Chrome is required for the screenshot helper:

```powershell
node scripts/screenshot.mjs --url "file:///C:/.../dev/preview.html?theme=light&tall=1" --out dev/preview-light.png
```

---

## 7. Privacy

See `privacy.html`. Addresses are sent only when you request a check, nothing is tracked, and all connections use HTTPS. The only declared exception is a single Google Fonts stylesheet loaded when the interface opens; no email or verification data is sent with it.

## 8. Governance

`AGENTS.md` is the project authority and is linked to `TODO.md` and `OrderLog.md`. No upload to Git is performed without explicit approval.

---

<p align="center">Built with care by <b>Ahmed Yousry</b> · <a href="https://github.com/el9a7rawi/Mail-Aura">Mail Aura</a></p>
