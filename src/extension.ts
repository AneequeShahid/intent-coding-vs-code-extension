import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "intent-coder" is now active!');

  // 1. Resolve Line Command
  const resolveLine = vscode.commands.registerCommand('intentCoder.resolveLine', () => {
    vscode.window.showInformationMessage('Intent Coder: Resolving Line (stub)...');
  });

  // 2. Selection Menu Command
  const selectionMenu = vscode.commands.registerCommand('intentCoder.selectionMenu', () => {
    vscode.window.showInformationMessage('Intent Coder: Showing Selection Menu (stub)...');
  });

  // 3. Switch Language Command
  const switchLanguage = vscode.commands.registerCommand('intentCoder.switchLanguage', () => {
    vscode.window.showInformationMessage('Intent Coder: Switching Language (stub)...');
  });

  // 4. Insert Template Command
  const insertTemplate = vscode.commands.registerCommand('intentCoder.insertTemplate', () => {
    vscode.window.showInformationMessage('Intent Coder: Inserting Template (stub)...');
  });

  // 5. Open Template Editor Command
  const openTemplateEditor = vscode.commands.registerCommand('intentCoder.openTemplateEditor', () => {
    vscode.window.showInformationMessage('Intent Coder: Opening Template Editor (stub)...');
  });

  context.subscriptions.push(
    resolveLine,
    selectionMenu,
    switchLanguage,
    insertTemplate,
    openTemplateEditor
  );
}

export function deactivate() {}
