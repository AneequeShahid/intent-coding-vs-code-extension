import * as vscode from 'vscode';

export function registerSelectionMenu(_context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('intentCoder.selectionMenu', () => {
    vscode.window.showInformationMessage('Intent Coder: Showing Selection Menu (stub)...');
  });
}
