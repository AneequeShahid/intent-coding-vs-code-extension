import * as vscode from 'vscode';

export function registerInsertTemplate(_context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('intentCoder.insertTemplate', () => {
    vscode.window.showInformationMessage('Intent Coder: Inserting Template (stub)...');
  });
}
