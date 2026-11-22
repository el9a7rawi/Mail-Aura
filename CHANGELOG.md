# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.4...HEAD
[0.1.4]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/el9a7rawi/Mail-Aura/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/el9a7rawi/Mail-Aura/releases/tag/v0.1.0
