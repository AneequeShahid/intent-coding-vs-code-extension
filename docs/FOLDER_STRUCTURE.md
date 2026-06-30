# Folder Structure

```
intent-coder/
├── .vscode/
│   ├── launch.json              # Extension Development Host debug config
│   └── tasks.json               # Build/watch tasks
│
├── .vscodeignore                # Files excluded from packaged .vsix
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── package.json                 # Extension manifest: commands, keybindings, settings
├── tsconfig.json
├── README.md
├── CHANGELOG.md
├── LICENSE
│
├── docs/
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   └── CONTRIBUTING.md
│
├── src/
│   ├── extension.ts              # Activation entry point, registers all commands
│   │
│   ├── parser/
│   │   ├── intentParser.ts       # Normalizes raw input → IntentQuery
│   │   ├── matcher.ts            # Exact + fuzzy matching against template index
│   │   └── types.ts              # IntentQuery, MatchResult, Ambiguity types
│   │
│   ├── templates/
│   │   ├── index.ts              # Loads + merges bundled + user templates
│   │   ├── bundled/
│   │   │   ├── cpp.templates.json
│   │   │   ├── python.templates.json
│   │   │   ├── java.templates.json
│   │   │   ├── rust.templates.json
│   │   │   └── javascript.templates.json
│   │   └── schema.ts             # Template TypeScript interface/validator
│   │
│   ├── llm/
│   │   ├── provider.ts           # LLMProvider interface
│   │   ├── anthropicProvider.ts
│   │   ├── openaiProvider.ts
│   │   ├── ollamaProvider.ts
│   │   ├── promptBuilder.ts      # Builds system+user prompt from intent/selection/context
│   │   └── responseParser.ts     # Strips fences, validates single code block
│   │
│   ├── commands/
│   │   ├── resolveLine.ts        # Implements line-trigger flow
│   │   ├── selectionMenu.ts      # Implements Ctrl+Enter QuickPick flow
│   │   ├── switchLanguage.ts
│   │   ├── insertTemplate.ts
│   │   └── editTemplates.ts
│   │
│   ├── ui/
│   │   ├── quickPick.ts          # Shared QuickPick builder/helpers
│   │   ├── statusBar.ts          # Shows current provider/status
│   │   └── notifications.ts      # Standardized error/info messages
│   │
│   ├── editor/
│   │   ├── editOperations.ts     # Insert/replace helpers wrapping editor.edit()
│   │   └── contextExtractor.ts   # Pulls surrounding lines/language/selection info
│   │
│   ├── config/
│   │   └── settings.ts           # Typed wrapper around workspace settings
│   │
│   └── secrets/
│       └── apiKeyStore.ts        # Wraps VS Code SecretStorage for API keys
│
├── test/
│   ├── unit/
│   │   ├── matcher.test.ts
│   │   ├── promptBuilder.test.ts
│   │   ├── responseParser.test.ts
│   │   └── templates.test.ts
│   └── suite/
│       ├── extension.test.ts     # VS Code integration tests (Extension Test Runner)
│       └── index.ts
│
├── media/                        # Icons, demo gifs for README/marketplace listing
│   ├── icon.png
│   └── demo.gif
│
└── scripts/
    └── validate-templates.ts     # CI script: validates all bundled template JSON against schema
```

## Notes on separation of concerns

- **`parser/`** and **`templates/`** have zero dependency on the `vscode` module — fully unit-testable outside the extension host.
- **`llm/`** is provider-agnostic; `extension.ts` wires up whichever provider is selected in settings.
- **`commands/`** is the only layer that touches `vscode.window` / `vscode.commands` directly — keeps VS Code API usage centralized and mockable.
- **`editor/`** isolates all `TextEditor`/`TextDocument` manipulation so undo-grouping and edit logic lives in one place.
