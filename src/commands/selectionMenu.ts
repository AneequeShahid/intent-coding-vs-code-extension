import * as vscode from 'vscode';
import { replaceSelection } from '../editor/editOperations';

export function registerSelectionMenu(_context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('intentCoder.selectionMenu', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active text editor found.');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    if (!selectedText || selectedText.trim() === '') {
      vscode.window.showInformationMessage('Please select some code first.');
      return;
    }

    const detectedLanguage = editor.document.languageId;

    const items: vscode.QuickPickItem[] = [
      {
        label: 'Convert to range loop',
        description: 'Transforms standard loops into range-based loops',
      },
      {
        label: 'Split into function',
        description: 'Extracts the selected code into a separate function helper',
      },
      {
        label: 'Add comments',
        description: 'Adds clean, explanatory inline comments to the selection',
      },
      {
        label: 'Optimize',
        description: 'Refactors selected code for better time/space efficiency',
      },
      {
        label: 'Translate to another language',
        description: 'Converts selection to a target programming language',
      },
      {
        label: 'Explain',
        description: 'Explains the selected code in an output panel',
      },
    ];

    const choice = await vscode.window.showQuickPick(items, {
      placeHolder: `Selection Menu (${detectedLanguage}) - Choose an action`,
    });

    if (!choice) {
      return;
    }

    if (choice.label === 'Explain') {
      vscode.window.showInformationMessage(`Intent Coder Explain Stub: Selected code has length ${selectedText.length}.`);
      return;
    }

    const commentedSnippet = getCommentedStub(detectedLanguage, choice.label, selectedText);
    await replaceSelection(editor, commentedSnippet);
  });
}

function getCommentedStub(language: string, action: string, originalText: string): string {
  const isCStyle = ['cpp', 'java', 'rust', 'javascript', 'typescript'].includes(language);
  const commentPrefix = isCStyle ? '// ' : '# ';
  
  return `${commentPrefix}Action: ${action}\n${commentPrefix}Original language: ${language}\n\n${originalText}\n\n${commentPrefix}End Action`;
}
