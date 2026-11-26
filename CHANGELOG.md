# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.8] - 2026-11-26

### Added

- A local email intelligence module that detects plain, angle-bracket, `mailto:`
  and obfuscated addresses, classifies providers, reports risk signals, suggests
  conservative corrections and produces a bounded local estimate.
- Privacy mode now shows that local estimate while keeping the `unknown` status.

### Fixed

- One shared syntax validator now governs the brain, correction engine and
  validation; invalid addresses are never rewritten into other invalid ones.
- Detection no longer invents addresses from URL or mailto query syntax.
- Source weights are prototype-safe and duplicate answers from one provider can
  no longer promote a verdict.

## [0.1.7] - 2026-11-26

### Fixed

- Never rewrite real domains such as `ymail.com` or `dmail.com` into a different
  provider: general letter substitution is replaced by documented digit slips
  and explicitly protected hosts.
- Treat the dedicated language key as authoritative when a stale settings object
  disagrees, and reflect the saved language in the language selector after reopen.
- Apply the same alias-aware duplicate rule in auto-fix as in the paste parser.
- Reject any correction that would produce an invalid address.

### Added

- Suffix and label scenarios total 522, plus fixed negative cases for real
  providers and ambiguous typos.

## [0.1.6] - 2026-11-24

### Added

- A conservative local typo engine covering 522 systematic scenarios: known
  suffix mistakes, duplicated/missing/swapped label characters, and role-mailbox
  typos, corrected only when a single well-known domain matches.
- Auto-correction now applies to pasted lists as well as CSV uploads, including
  in Privacy mode.

### Fixed

- A language chosen in the side panel survives closing and reopening it.
- Open the side panel and the context-menu result surface synchronously from
  the click handler, before any `await`, so the user gesture survives and the
  panel opens in Chrome, Edge, Brave, Opera and Firefox.
- Give the Firefox package its own privacy disclosure (`sidebar_action` and
  Mozilla policies instead of `sidePanel` and Chrome Web Store wording).
- Replace the build-time `sed` patch with a reviewable transform that removes
  the Chrome-only branches entirely instead of leaving dead `if (undefined)` code.
- Correct the browser-version and background-model wording in the release notes.

## [0.1.5] - 2026-11-22

### Changed

- Refine the settings switch: a symmetric 16px knob with even 3px insets and a
  balanced shadow, replacing the uneven, bordered appearance.
- Regenerate every README screenshot with transparent rounded corners, full
  language options, a complete side-panel view, and a single filter/search capture.

## [0.1.4] - 2026-11-22

### Changed

- Redesign the status notification as an animated pill with a countdown bar; it
  now auto-dismisses and collapses to zero height when empty instead of leaving
  a blank gap between the hero actions and the source card.

## [0.1.3] - 2026-11-22

### Added

- Dedicated Firefox archive with a Firefox-specific manifest (sidebar action,
  classic background script, data-collection disclosure) and a clean `web-ext lint`.
- Bundle Inter, Cairo and Tajawal as local WOFF2 files instead of requesting a
  remote stylesheet at runtime; the CSP now restricts `font-src` to `self`.
- Localized section screenshots for all eight interface languages.
- `CHANGELOG.md` and the SIL OFL 1.1 notice for the bundled fonts.

### Fixed

- Ship the privacy page bootstrap as an external module so its theme and
  language work under MV3's no-inline-script CSP.
- Stop malformed `mailto:` URLs and stale in-flight scans from breaking the
  context-menu result.
- Keep cached domain verdicts from reappearing after the cache is cleared.
- Parse quoted CSV cells that span physical lines.
- Propagate accessibility/locale keys to all eight translations, restoring CI.
- Require two independent MX confirmations before a `valid` verdict.

### Changed

- Raise the switch OFF-state contrast and expose select values and switch roles
  to assistive technology.
- Release archives now carry every runtime file, including fonts and licenses.

## [0.1.2] - 2026-11-18

### Added

- Score caveats, clearer live regions, and a dedicated results-count announcement.

### Fixed

- CSV header detection and `mailto:` query parsing.
- Corrected addresses are written to the Email column on export.

## [0.1.1] - 2026-11-18

### Changed

- Streamlined the language switcher and aligned documentation with the shipped UI.

## [0.1.0] - 2026-11-18

### Added

- Initial MV3 release: eight keyless HTTPS sources, eight locales, CSV import and
  export, context-menu verification, side panel, dark theme, and privacy mode.

[Unreleased]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.8...HEAD
[0.1.8]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/el9a7rawi/Mail-Aura/releases/tag/v0.1.0
