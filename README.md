# Intent Coder

Intent Coder is a VS Code extension that converts small, explicit programmer intents into correct, language-specific code at the cursor — one snippet at a time. It accelerates your coding speed by matching intents against deterministic local templates first, with a fallback to a clean LLM generation if no template is found.

## Features

- **Line Intent → Snippet (`Enter`)**: Type an intent (e.g. `fast io` or `read array`) on a line and press `Enter` to expand it.
- **Selection → Action Menu (`Ctrl+Enter`)**: Select a block of code and press `Ctrl+Enter` to optimize, comment, explain, or translate it.
- **Template Library**: Insert common algorithmic and data structure boilerplate fully offline.
- **Language Switching (`Ctrl+Alt+L`)**: Quickly swap target languages and re-resolve intents.

---

## Commands

The extension contributes the following commands to the Command Palette:

| Command ID | Title | Keybinding |
| :--- | :--- | :--- |
| `intentCoder.resolveLine` | Intent Coder: Resolve Line | `Enter` (when editing) |
| `intentCoder.selectionMenu` | Intent Coder: Selection Actions | `Ctrl+Enter` (when text selected) |
| `intentCoder.switchLanguage` | Intent Coder: Switch Language | `Ctrl+Alt+L` |
| `intentCoder.insertTemplate` | Intent Coder: Insert Template | None (Palette only) |
| `intentCoder.openTemplateEditor` | Intent Coder: Edit Custom Templates | None (Palette only) |

---

## Configuration Settings

Customize Intent Coder behavior using the following VS Code settings:

- `intentCoder.triggerKey`: Key to resolve intent on a line (options: `"enter"`, `"tab"`, `"none"`, default: `"enter"`).
- `intentCoder.llmProvider`: LLM provider for fallback suggestions (options: `"anthropic"`, `"openai"`, `"ollama"`, `"none"`, default: `"anthropic"`).
- `intentCoder.model`: Model identifier (default: `"claude-3-5-sonnet"`).
- `intentCoder.maxContextLines`: Surrounding lines sent to LLM for context (default: `10`).
- `intentCoder.templatesPath`: Path to custom template overrides (default: `""`).
- `intentCoder.enableInlinePreview`: Show inline ghost-text preview before committing changes (default: `false`).

---

## Secure API Key Setup

API Keys are stored securely using VS Code's `SecretStorage`. The extension works fully in template-only mode even with no API key configured.

---

## Developer Guide

### Scaffolding and Building
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build/compile the extension:
   ```bash
   npm run compile
   ```
3. Run tests in isolation:
   ```bash
   npm run test:unit
   ```

### Debugging the Extension
1. Open the project in VS Code.
2. Press `F5` to open the **Extension Development Host**.
3. Create or open a code file (e.g. `.cpp` or `.py`) and test commands.
