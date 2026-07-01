import * as vscode from 'vscode';
import { getSettings } from '../config/settings';
import { loadTemplates } from '../templates';
import { matchIntent, extractParam, substituteParams } from '../parser/matcher';
import { shouldTrigger } from '../parser/lineTrigger';
import { SupportedLanguage } from '../templates/schema';

interface PendingPreview {
  documentUri: string;
  line: number;
  code: string;
  originalLineLength: number;
}

let pendingPreview: PendingPreview | undefined;
let extensionPath: string | undefined;

function mapLanguageId(languageId: string): SupportedLanguage | undefined {
  const map: Record<string, SupportedLanguage> = {
    'cpp': 'cpp',
    'python': 'python',
    'java': 'java',
    'rust': 'rust',
    'javascript': 'javascript',
    'typescript': 'typescript',
  };
  return map[languageId];
}

export class IntentCoderInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _context: vscode.InlineCompletionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.InlineCompletionList | vscode.InlineCompletionItem[]> {
    // 1. Explicit Alt+Enter trigger preview
    if (pendingPreview) {
      if (
        document.uri.toString() === pendingPreview.documentUri &&
        position.line === pendingPreview.line
      ) {
        const insertPos = new vscode.Position(pendingPreview.line, pendingPreview.originalLineLength);
        const completionItem = new vscode.InlineCompletionItem(
          pendingPreview.code,
          new vscode.Range(insertPos, insertPos)
        );
        completionItem.command = {
          command: 'intentCoder.cleanInlinePrefix',
          title: 'Clean Inline Prefix',
          arguments: [document.uri, pendingPreview.line, pendingPreview.originalLineLength]
        };

        // Clear once provided
        pendingPreview = undefined;
        return [completionItem];
      }
    }

    // 2. Automatic preview as-you-type (for exact template matches only)
    const settings = getSettings();
    if (!settings.enableInlinePreview) {
      return undefined;
    }

    const lineText = document.lineAt(position.line).text;
    if (!shouldTrigger(lineText)) {
      return undefined;
    }

    const lang = mapLanguageId(document.languageId);
    if (!lang) {
      return undefined;
    }

    if (!extensionPath) {
      return undefined;
    }

    const index = loadTemplates(extensionPath);
    const matchResult = matchIntent(lineText, lang, index);

    if (matchResult.status === 'exact') {
      const template = matchResult.matches[0];
      const paramVal = extractParam(lineText, template);
      const code = substituteParams(template.code, paramVal, template);

      const insertPos = new vscode.Position(position.line, lineText.length);
      const completionItem = new vscode.InlineCompletionItem(
        code,
        new vscode.Range(insertPos, insertPos)
      );
      completionItem.command = {
        command: 'intentCoder.cleanInlinePrefix',
        title: 'Clean Inline Prefix',
        arguments: [document.uri, position.line, lineText.length]
      };
      return [completionItem];
    }

    return undefined;
  }
}

export function showInlinePreview(document: vscode.TextDocument, line: number, code: string): void {
  pendingPreview = {
    documentUri: document.uri.toString(),
    line,
    code,
    originalLineLength: document.lineAt(line).text.length
  };
  vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
}

export function clearInlinePreview(): void {
  pendingPreview = undefined;
}

export function activateInlinePreview(context: vscode.ExtensionContext): void {
  extensionPath = context.extensionPath;
  const provider = new IntentCoderInlineCompletionProvider();
  const supportedLanguages = ['cpp', 'python', 'java', 'rust', 'javascript', 'typescript'];
  for (const lang of supportedLanguages) {
    context.subscriptions.push(
      vscode.languages.registerInlineCompletionItemProvider(
        { language: lang },
        provider
      )
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('intentCoder.cleanInlinePrefix', async (uri: vscode.Uri, lineNum: number, length: number) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.uri.toString() === uri.toString()) {
        await editor.edit((editBuilder) => {
          editBuilder.delete(new vscode.Range(
            new vscode.Position(lineNum, 0),
            new vscode.Position(lineNum, length)
          ));
        });
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => {
      clearInlinePreview();
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      if (pendingPreview && e.selections[0] && e.selections[0].active.line !== pendingPreview.line) {
        clearInlinePreview();
      }
    })
  );
}
