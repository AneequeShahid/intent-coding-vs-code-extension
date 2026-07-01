import * as vscode from 'vscode';
import { registerResolveLine } from './commands/resolveLine';
import { registerSelectionMenu } from './commands/selectionMenu';
import { registerSwitchLanguage } from './commands/switchLanguage';
import { registerInsertTemplate } from './commands/insertTemplate';
import { registerEditTemplates } from './commands/editTemplates';
import { activateStatusBar } from './ui/statusBar';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "intent-coder" is now active!');

  activateStatusBar(context);

  context.subscriptions.push(
    registerResolveLine(context),
    registerSelectionMenu(context),
    registerSwitchLanguage(context),
    registerInsertTemplate(context),
    registerEditTemplates(context)
  );
}

export function deactivate() {}
