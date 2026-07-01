import * as vscode from 'vscode';
import { ApiKeyStore } from '../secrets/apiKeyStore';

let statusBarItem: vscode.StatusBarItem | undefined;

export function activateStatusBar(context: vscode.ExtensionContext): void {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'intentCoder.switchLanguage';
  context.subscriptions.push(statusBarItem);
  updateStatusBar(context.secrets);
}

export async function updateStatusBar(secrets: vscode.SecretStorage): Promise<void> {
  if (!statusBarItem) {
    return;
  }
  const apiKeyStore = new ApiKeyStore(secrets);
  const key = await apiKeyStore.getApiKey();
  const hasKey = !!key && key.trim().length > 0;

  if (hasKey) {
    statusBarItem.text = '$(zap) Intent Coder';
    statusBarItem.tooltip = 'Intent Coder: LLM configured';
    statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
  } else {
    statusBarItem.text = '$(database) Intent Coder (offline)';
    statusBarItem.tooltip = 'Intent Coder: Template-only mode';
    statusBarItem.color = undefined;
  }
  statusBarItem.show();
}

export function setStatusBarInFlight(): void {
  if (statusBarItem) {
    statusBarItem.text = '$(sync~spin) Intent Coder...';
    statusBarItem.tooltip = 'Intent Coder: Generating...';
    statusBarItem.color = undefined;
    statusBarItem.show();
  }
}
