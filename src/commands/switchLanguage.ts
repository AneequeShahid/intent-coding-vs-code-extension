import * as vscode from 'vscode';

export function registerSwitchLanguage(_context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('intentCoder.switchLanguage', () => {
    vscode.window.showInformationMessage('Intent Coder: Switching Language (stub)...');
  });
}
