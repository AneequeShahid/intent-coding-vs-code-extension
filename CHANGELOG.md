# Changelog

All notable changes to the "intent-coder" extension will be documented in this file.

## [0.0.2] - 2026-07-01
- Fix: Extension now activates correctly when opening C++, Python, Java, Rust, JavaScript, and TypeScript files (activation events were empty in 0.0.1).
- Fix: Inline ghost-text preview now triggers automatically as-you-type for exact template matches.
- Fix: Registered inline completion provider per-language instead of a wildcard pattern to ensure correct VS Code routing.
- Improvement: `enableInlinePreview` now defaults to `true` — ghost-text is on out of the box.
- Improvement: Added activation toast notification ("Intent Coder activated ✓") to confirm the extension has loaded.

## [0.0.1] - 2026-06-30
- Initial scaffold and configuration of the project.
