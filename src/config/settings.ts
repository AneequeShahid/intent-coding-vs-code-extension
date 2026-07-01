import * as vscode from 'vscode';

export interface ExtensionSettings {
  triggerKey: 'enter' | 'tab' | 'none';
  llmProvider: 'anthropic' | 'openai' | 'ollama' | 'none';
  model: string;
  maxContextLines: number;
  templatesPath: string;
  enableInlinePreview: boolean;
  ollamaHost: string;
  ollamaModel: string;
  ollamaTimeoutMs: number;
}

let testSettingsOverride: Partial<ExtensionSettings> | undefined;

export function setTestSettingsOverride(override: Partial<ExtensionSettings> | undefined): void {
  testSettingsOverride = override;
}

export function getSettings(): ExtensionSettings {
  const config = vscode.workspace.getConfiguration('intentCoder');

  const base: ExtensionSettings = {
    triggerKey: config.get<'enter' | 'tab' | 'none'>('triggerKey', 'enter'),
    llmProvider: config.get<'anthropic' | 'openai' | 'ollama' | 'none'>('llmProvider', 'anthropic'),
    model: config.get<string>('model', 'claude-3-5-sonnet'),
    maxContextLines: config.get<number>('maxContextLines', 10),
    templatesPath: config.get<string>('templatesPath', ''),
    enableInlinePreview: config.get<boolean>('enableInlinePreview', true),
    ollamaHost: config.get<string>('ollamaHost', 'http://localhost:11434'),
    ollamaModel: config.get<string>('ollamaModel', 'qwen2.5-coder:7b'),
    ollamaTimeoutMs: config.get<number>('ollamaTimeoutMs', 15000),
  };

  if (testSettingsOverride) {
    return { ...base, ...testSettingsOverride };
  }
  return base;
}
