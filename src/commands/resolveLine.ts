import * as vscode from 'vscode';

export function registerResolveLine(_context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('intentCoder.resolveLine', () => {
    vscode.window.showInformationMessage('Intent Coder: Resolving Line (stub)...');
  });
}
