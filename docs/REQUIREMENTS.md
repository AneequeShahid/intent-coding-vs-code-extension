# Intent Coder — Requirements

## 1. Vision

A VS Code extension that converts small, explicit programmer intents into correct,
language-specific code at the cursor — one snippet at a time. No autonomous edits,
no multi-file changes, no terminal execution. The programmer stays in control of
architecture; the tool only accelerates typing.

**Non-goals (explicitly out of scope):**
- No agentic planning or multi-step task execution
- No filesystem access beyond the active editor buffer
- No terminal/shell command execution
- No multi-file or project-wide edits
- No automatic acceptance of changes without an explicit user action (Enter / QuickPick selection)

---

## 2. Core User Flows

### 2.1 Line Intent → Snippet
1. User types a short phrase or task description on a line (e.g. `Read integer`, `arr.sort`, `Fast IO`).
2. User presses Enter (or a dedicated trigger key, e.g. `Tab` twice, configurable).
3. Extension matches the phrase against deterministic templates first; if no match, falls back to LLM.
4. The matched line is replaced (or the snippet inserted below it) with the generated code.
5. If multiple interpretations exist (e.g. `arr.sort`), show a QuickPick menu instead of auto-inserting.

### 2.2 Selection → Action Menu (Ctrl+Enter)
1. User selects a block of code.
2. User presses `Ctrl+Enter`.
3. A QuickPick menu appears with context-aware actions:
   - Convert to range loop
   - Split into function
   - Add comments
   - Optimize
   - Translate to [language]
   - Explain (shown as hover/output panel, not inserted as code)
4. Selecting an action calls the LLM (or a deterministic transform, where possible) and replaces the selection.

### 2.3 Language Switching
1. User has a generated snippet in the buffer.
2. User runs command "Intent Coder: Switch Language" (command palette or keybinding).
3. QuickPick shows target languages.
4. Last intent is re-resolved against the new language's template set or re-prompted to the LLM with the new target language.

### 2.4 Template Library Browsing
1. Command palette: "Intent Coder: Insert Template".
2. QuickPick of categorized templates (Fast IO, DFS, BFS, Segment Tree, Binary Search, Priority Queue, etc.), filtered by current file's language.
3. Selected template inserted at cursor.

---

## 3. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | Extension activates on supported language files (cpp, python, java, rust, javascript, typescript — extensible list) |
| FR-2 | Deterministic template matcher runs with zero network calls and < 50ms latency |
| FR-3 | LLM fallback only triggers when no deterministic template matches |
| FR-4 | All LLM responses are constrained to return exactly one code block (no prose, no explanation) — enforced via prompt + response parsing |
| FR-5 | User must explicitly trigger every transformation (Enter, Ctrl+Enter, or command) — no automatic/background suggestions inserted without action |
| FR-6 | Ctrl+Enter menu is context-aware: options change based on selected code's detected language and structure (loop, function, class, etc.) |
| FR-7 | API key for the LLM provider is stored via VS Code SecretStorage, never in plaintext settings |
| FR-8 | Extension works fully (template-only mode) with no API key configured — LLM features degrade gracefully with a clear message |
| FR-9 | Template library is user-extensible via a local JSON/YAML file the user can edit |
| FR-10 | All actions are undoable via standard VS Code undo (single edit operation per action) |
| FR-11 | Inline ghost-text preview (optional, Phase 2) shown before committing a generated snippet |
| FR-12 | "Explain" action outputs to a side panel/output channel, never injected into code |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Template match + insert: < 100ms perceived latency |
| NFR-2 | LLM round-trip: target < 3s for typical snippet-sized requests |
| NFR-3 | No telemetry/data collection beyond what's required for LLM calls; no code sent to LLM without explicit user-triggered action |
| NFR-4 | Extension must not crash or block the editor on LLM timeout/failure — fail with a non-blocking notification |
| NFR-5 | Codebase in TypeScript, strict mode, linted (ESLint + Prettier) |
| NFR-6 | Unit-testable parser/matcher logic decoupled from VS Code API (testable in isolation with Jest/Vitest) |
| NFR-7 | Support VS Code Engine >= 1.85 |

---

## 5. LLM Integration Requirements

- Pluggable provider interface (`LLMProvider`) so backend (Anthropic, OpenAI, local Ollama) can be swapped.
- System prompt enforces: "Return ONLY a single code block in the target language. No explanation, no markdown prose outside the code fence."
- Response parser strips markdown fences and validates exactly one code block was returned; on violation, retry once with a stricter prompt, then surface an error.
- Context sent to LLM is minimal by default: current line/selection + language + (optionally) a few lines of surrounding context — never the whole file unless the user opts in via setting.

---

## 6. Template System Requirements

- Templates stored as structured data, not hardcoded strings in logic files:
  ```json
  {
    "id": "fast-io-cpp",
    "trigger": ["fast io", "fastio"],
    "language": "cpp",
    "category": "io",
    "code": "ios_base::sync_with_stdio(false);\ncin.tie(NULL);"
  }
  ```
- Matching strategy: normalize input (lowercase, trim, strip punctuation) → exact trigger match → fuzzy match (Levenshtein/substring) → ambiguous match shows QuickPick disambiguation.
- Each template can declare `params` (e.g. variable name `n`) so generated code can reuse the user's existing variable names. Phase 2.

---

## 7. Settings (contributed via `package.json`)

| Setting | Type | Default | Description |
|---|---|---|---|
| `intentCoder.triggerKey` | enum | `enter` | `enter` / `tab` / `none` (command-only) |
| `intentCoder.llmProvider` | enum | `anthropic` | `anthropic` / `openai` / `ollama` / `none` |
| `intentCoder.model` | string | `claude-sonnet-4-6` | Model identifier |
| `intentCoder.maxContextLines` | number | `10` | Lines of surrounding context sent to LLM |
| `intentCoder.templatesPath` | string | (bundled) | Path to user-defined template overrides |
| `intentCoder.enableInlinePreview` | boolean | `false` | Phase 2 ghost-text preview |

---

## 8. Commands (contributed via `package.json`)

| Command ID | Title | Default Keybinding |
|---|---|---|
| `intentCoder.resolveLine` | Intent Coder: Resolve Line | `Enter` (context: line matches trigger pattern) |
| `intentCoder.selectionMenu` | Intent Coder: Selection Actions | `Ctrl+Enter` |
| `intentCoder.switchLanguage` | Intent Coder: Switch Language | `Ctrl+Alt+L` |
| `intentCoder.insertTemplate` | Intent Coder: Insert Template | — |
| `intentCoder.openTemplateEditor` | Intent Coder: Edit Custom Templates | — |

---

## 9. Phased Roadmap

**Phase 1 (MVP)**
- Selection → Ctrl+Enter → QuickPick → LLM transform/replace
- Deterministic template library (CP-focused: fast IO, common loops, data structure boilerplate)
- Basic line-trigger flow bound to a command (not yet intercepting native Enter)

**Phase 2**
- Native Enter interception via `registerInlineCompletionItemProvider`
- Language switching for last-generated snippet
- Inline ghost-text preview before commit
- User-extensible template file + template editor UI

**Phase 3**
- Parameter-aware templates (reuse existing variable names)
- Multi-provider LLM support (Ollama for fully offline use)
- Telemetry-free usage stats panel (local only) — "snippets generated", "tokens saved"

---

## 10. Success Criteria

- A competitive programmer can write a full CP solution template (fast IO + read array + core loop) using only triggers/templates, zero hand-typed boilerplate, in under 10 seconds.
- Zero instances of the extension editing code outside the user's current selection/line without an explicit trigger.
- Deterministic templates resolve > 80% of common CP/boilerplate intents without any LLM call.
