import * as vscode from 'vscode';
import { getSettings } from '../config/settings';
import { ApiKeyStore } from '../secrets/apiKeyStore';
import { OllamaProvider } from '../llm/ollamaProvider';

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

  const settings = getSettings();
  const providerId = settings.llmProvider;

  if (providerId === 'anthropic') {
    const apiKeyStore = new ApiKeyStore(secrets);
    const key = await apiKeyStore.getApiKey();
    const hasKey = !!key && key.trim().length > 0;

    if (hasKey) {
      statusBarItem.text = '$(zap) Intent Coder';
      statusBarItem.tooltip = 'Intent Coder: Anthropic LLM configured';
      statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
    } else {
      statusBarItem.text = '$(database) Intent Coder (offline)';
      statusBarItem.tooltip = 'Intent Coder: Template-only mode (Anthropic missing key)';
      statusBarItem.color = undefined;
    }
  } else if (providerId === 'ollama') {
    const provider = new OllamaProvider();
    const isOnline = await provider.isConfigured();

    if (isOnline) {
      statusBarItem.text = '$(circuit-board) Intent Coder (local)';
      statusBarItem.tooltip = 'Intent Coder: Ollama offline model active';
      statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
    } else {
      statusBarItem.text = '$(warning) Intent Coder (Ollama offline)';
      statusBarItem.tooltip = 'Intent Coder: Ollama server is unreachable';
      statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
    }
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
