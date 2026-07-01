import * as vscode from 'vscode';
import { loadTemplates } from '../templates';
import { SupportedLanguage } from '../templates/schema';
import { matchIntent, extractParam, substituteParams } from '../parser/matcher';
import { shouldTrigger } from '../parser/lineTrigger';
import { replaceCurrentLine } from '../editor/editOperations';
import { getActiveProvider } from '../llm/providerFactory';
import { setStatusBarInFlight, updateStatusBar } from '../ui/statusBar';
import { getSettings } from '../config/settings';
import { showInlinePreview } from '../ui/inlinePreview';

export function registerResolveLine(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('intentCoder.resolveLine', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const lineNum = editor.selection.active.line;
    const commitCode = async (resolvedCode: string) => {
      const settings = getSettings();
      if (settings.enableInlinePreview) {
        showInlinePreview(editor.document, lineNum, resolvedCode);
      } else {
        await replaceCurrentLine(editor, resolvedCode);
      }
    };

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
      const template = matchResult.matches[0];
      const paramVal = extractParam(lineText, template);
      const code = substituteParams(template.code, paramVal, template);
      await commitCode(code);
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
        const template = choice.template;
        const paramVal = extractParam(lineText, template);
        const code = substituteParams(template.code, paramVal, template);
        await commitCode(code);
      }
      return;
    }

    const provider = getActiveProvider(context);
    if (!provider) {
      vscode.window.showInformationMessage(
        "No LLM provider configured."
      );
      return;
    }

    const isConfigured = await provider.isConfigured();
    if (!isConfigured) {
      if (provider.id === 'anthropic') {
        vscode.window.showInformationMessage(
          "No API key set. Use 'Intent Coder: Set API Key' command."
        );
      } else if (provider.id === 'ollama') {
        vscode.window.showWarningMessage(
          "Ollama server is not running or unreachable."
        );
      }
      return;
    }

    setStatusBarInFlight();
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
          await commitCode(response.code);
        } catch (err: any) {
          vscode.window.showErrorMessage(`Generation failed: ${err.message}`);
        } finally {
          await updateStatusBar(context.secrets);
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
