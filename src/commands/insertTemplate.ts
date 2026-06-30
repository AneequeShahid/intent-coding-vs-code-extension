import * as vscode from 'vscode';
import { loadTemplates } from '../templates';
import { SupportedLanguage } from '../templates/schema';
import { replaceSelection } from '../editor/editOperations';

export function registerInsertTemplate(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('intentCoder.insertTemplate', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active text editor found.');
      return;
    }

    const vscodeLang = editor.document.languageId;
    const lang = mapLanguageId(vscodeLang);
    if (!lang) {
      vscode.window.showWarningMessage(`Language "${vscodeLang}" is not supported for templates.`);
      return;
    }

    const index = loadTemplates(context.extensionPath);
    const templates = index.byLanguage.get(lang) || [];

    if (templates.length === 0) {
      vscode.window.showInformationMessage(`No templates found for language "${lang}".`);
      return;
    }

    const items = templates.map((t) => ({
      label: t.label || t.id,
      description: `[${t.category}]`,
      detail: t.description,
      template: t,
    }));

    const choice = await vscode.window.showQuickPick(items, {
      placeHolder: `Insert Template (${lang}) - Select a template to insert`,
    });

    if (!choice) {
      return;
    }

    await replaceSelection(editor, choice.template.code);
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
