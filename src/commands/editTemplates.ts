import * as vscode from 'vscode';

export function registerEditTemplates(_context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('intentCoder.openTemplateEditor', () => {
    vscode.window.showInformationMessage('Intent Coder: Opening Template Editor (stub)...');
  });
}
