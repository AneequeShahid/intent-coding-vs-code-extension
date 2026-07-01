import * as vscode from 'vscode';
import { loadTemplates } from '../templates';
import { SupportedLanguage } from '../templates/schema';
import { matchIntent } from '../parser/matcher';
import { shouldTrigger } from '../parser/lineTrigger';
import { replaceCurrentLine } from '../editor/editOperations';
import { ApiKeyStore } from '../secrets/apiKeyStore';
import { AnthropicProvider } from '../llm/anthropicProvider';

export function registerResolveLine(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('intentCoder.resolveLine', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const position = editor.selection.active;
    const line = editor.document.lineAt(position.line);
    const lineText = line.text;

    if (!shouldTrigger(lineText)) {
      await editor.edit((editBuilder) => {
        editBuilder.insert(position, '\n');
      });
      return;
    }

    const vscodeLang = editor.document.languageId;
    const lang = mapLanguageId(vscodeLang);
    if (!lang) {
      vscode.window.showWarningMessage(`Language "${vscodeLang}" is not supported.`);
      return;
    }

    const index = loadTemplates(context.extensionPath);
    const matchResult = matchIntent(lineText, lang, index);

    if (matchResult.status === 'exact') {
      const code = matchResult.matches[0].code;
      await replaceCurrentLine(editor, code);
      return;
    } else if (matchResult.status === 'ambiguous') {
      const items = matchResult.matches.map((t) => ({
        label: t.label || t.id,
        description: t.description,
        template: t,
      }));
      const choice = await vscode.window.showQuickPick(items, {
        placeHolder: 'Ambiguous intent - Select a template to resolve',
      });
      if (choice) {
        await replaceCurrentLine(editor, choice.template.code);
      }
      return;
    }

    const apiKeyStore = new ApiKeyStore(context.secrets);
    const provider = new AnthropicProvider(apiKeyStore);

    const isConfigured = await provider.isConfigured();
    if (!isConfigured) {
      vscode.window.showInformationMessage(
        "No API key set. Use 'Intent Coder: Set API Key' command."
      );
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Intent Coder: Generating snippet...',
        cancellable: false,
      },
      async () => {
        try {
          const response = await provider.generate({
            sourceText: lineText,
            language: lang,
            action: 'line-intent',
          });
          await replaceCurrentLine(editor, response.code);
        } catch (err: any) {
          vscode.window.showErrorMessage(`Generation failed: ${err.message}`);
        }
      }
    );
  });
}

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
