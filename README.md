# Intent Coder

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/AneequeShahid.intent-coder?color=blue&label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=AneequeShahid.intent-coder)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/AneequeShahid.intent-coder)](https://marketplace.visualstudio.com/items?itemName=AneequeShahid.intent-coder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Type what you want. Press `Alt+Enter`. Get code. No AI agent. No multi-file edits. Just: **intent → snippet**, one line at a time.

**[Install from VS Code Marketplace →](https://marketplace.visualstudio.com/items?itemName=AneequeShahid.intent-coder)**

---

## What is Intent Coder?

Intent Coder is a VS Code extension that converts small, explicit programming intents into correct, language-specific code at the cursor — one snippet at a time.

Unlike AI coding agents that rewrite your entire project, Intent Coder:
- Inserts **exactly one code block** per action
- Never touches files outside your current selection or line
- Works **fully offline** with no API key via a deterministic template library
- Falls back to an LLM only when no template matches — and only when you trigger it

Built for competitive programmers, students, interview prep, and developers who know exactly what they want but don't want to type boilerplate.

---

## Demo

![Intent Coder Extension](resources/icon.png)

> *Full demo GIF coming soon*

---

## Features

### Line Intent → Snippet (`Alt+Enter`)
Type a plain-English intent on any line and press `Alt+Enter` to expand it instantly.

```
fast io         →   ios_base::sync_with_stdio(false); cin.tie(NULL);
read array      →   int arr[n]; for(int i=0;i<n;i++) cin>>arr[i];
binary search   →   standard binary search template
dfs             →   depth-first search skeleton
```

Fuzzy matching handles typos — `deph first search` still resolves to DFS.

### Inline Ghost-Text Preview
Enable `intentCoder.enableInlinePreview` to see a ghost-text suggestion appear as you type — press `Tab` to accept, `Escape` to dismiss.

### Selection → Action Menu (`Ctrl+Enter`)
Select any code block and press `Ctrl+Enter` for a context menu:
- Convert to range loop
- Split into function
- Add comments
- Optimize
- Translate to another language
- Explain (output to panel, never inserted into code)

### Multi-Language Template Library (Offline)
Deterministic templates for **C++, Python, Java, and Rust** — zero network calls, zero API key required.

### Ollama Fully Offline LLM
No cloud, no API key. Run LLM fallback 100% locally using Ollama.

### Parameter-Aware Templates
Templates reuse variable names already in your intent — `read array of n integers` uses `n` from your context.

---

## Installation

### From VS Code Marketplace (recommended)
1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for **Intent Coder**
4. Click **Install**

Or install directly:
```bash
ext install AneequeShahid.intent-coder
```

### From VSIX (manual)
1. Download `intent-coder-0.0.2.vsix` from [GitHub Releases](https://github.com/AneequeShahid/intent-coding-vs-code-extension/releases)
2. In VS Code: `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
3. Select the downloaded file

---

## Quick Start

1. Open any `.cpp`, `.py`, `.java`, `.rs`, `.js`, or `.ts` file
2. Type an intent on a blank line, e.g. `fast io`
3. Press `Alt+Enter`
4. The line is replaced with the correct snippet

**Single undo** — press `Ctrl+Z` to revert in one step.

---

## Commands

| Command | Title | Keybinding |
|---|---|---|
| `intentCoder.resolveLine` | Intent Coder: Resolve Line | `Alt+Enter` |
| `intentCoder.selectionMenu` | Intent Coder: Selection Actions | `Ctrl+Enter` |
| `intentCoder.switchLanguage` | Intent Coder: Switch Language | `Ctrl+Alt+L` |
| `intentCoder.insertTemplate` | Intent Coder: Insert Template | Command Palette |
| `intentCoder.openTemplateEditor` | Intent Coder: Edit Custom Templates | Command Palette |

---

## Configuration

| Setting | Type | Default | Description |
|---|---|---|---|
| `intentCoder.llmProvider` | enum | `anthropic` | `anthropic` / `openai` / `ollama` / `none` |
| `intentCoder.model` | string | `claude-sonnet-4-6` | Model identifier |
| `intentCoder.ollamaHost` | string | `http://localhost:11434` | Ollama server URL |
| `intentCoder.ollamaModel` | string | `qwen2.5-coder:7b` | Ollama model tag |
| `intentCoder.enableInlinePreview` | boolean | `true` | Show ghost-text preview before committing |
| `intentCoder.maxContextLines` | number | `10` | Lines of context sent to LLM |
| `intentCoder.templatesPath` | string | — | Path to custom template JSON overrides |

---

## API Key Setup

API keys are stored securely using VS Code's built-in `SecretStorage` — never in plaintext settings or files.

To set your Anthropic API key:
1. `Ctrl+Shift+P` → `Intent Coder: Set API Key`
2. Paste your key — it is stored encrypted and never logged

The extension works fully in **template-only mode** with no API key configured.

---

## Offline Mode (Ollama)

Intent Coder works 100% offline with no API key using [Ollama](https://ollama.com):

```bash
# 1. Install Ollama
# https://ollama.com/download

# 2. Pull a coding model
ollama pull qwen2.5-coder:7b

# 3. Start Ollama (runs automatically on most installs)
ollama serve
```

Then in VS Code settings set `intentCoder.llmProvider` to `ollama`.

Status bar shows:
- `⊛ Intent Coder (local)` — Ollama running and ready
- `⚠ Intent Coder (Ollama offline)` — server not reachable

---

## Template Library

Templates are bundled for four languages. Example C++ triggers:

| Trigger | Inserts |
|---|---|
| `fast io` | `ios_base::sync_with_stdio(false); cin.tie(NULL);` |
| `read int` | `int n; cin >> n;` |
| `read array` | Array read loop |
| `dfs` | DFS skeleton with visited set |
| `bfs` | BFS skeleton with queue |
| `binary search` | Standard binary search |
| `sort ascending` | `sort(arr.begin(), arr.end())` |
| `segment tree` | Segment tree scaffold |
| `priority queue` | Max heap setup |

Full template lists for Python, Java, and Rust are in `src/templates/bundled/`.

### Custom Templates

Add your own templates by creating a JSON file and setting `intentCoder.templatesPath`:

```json
[
  {
    "id": "my-template",
    "trigger": ["my trigger phrase"],
    "language": "cpp",
    "category": "misc",
    "code": "// your code here"
  }
]
```

---

## Development

```bash
git clone https://github.com/AneequeShahid/intent-coding-vs-code-extension
cd intent-coding-vs-code-extension
npm install
npm run compile
```

Press `F5` in VS Code to launch the Extension Development Host.

```bash
npm run lint          # ESLint check
npm run test:unit     # Unit tests (no VS Code host required)
```

---

## Contributing

Issues and PRs welcome. Please follow the existing commit style: lowercase, imperative, one logical change per commit.

---

## License

MIT — see [LICENSE](LICENSE)

---

*Built by [Aneeque Shahid](https://github.com/AneequeShahid)*
