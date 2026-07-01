import * as vscode from 'vscode';
import { getSettings } from '../config/settings';
import { LLMProvider } from './provider';
import { AnthropicProvider } from './anthropicProvider';
import { OllamaProvider } from './ollamaProvider';
import { ApiKeyStore } from '../secrets/apiKeyStore';

export function getActiveProvider(context: vscode.ExtensionContext): LLMProvider | undefined {
  const settings = getSettings();
  const providerId = settings.llmProvider;

  switch (providerId) {
    case 'anthropic':
      return new AnthropicProvider(new ApiKeyStore(context.secrets));
    case 'ollama':
      return new OllamaProvider();
    default:
      return undefined;
  }
}
