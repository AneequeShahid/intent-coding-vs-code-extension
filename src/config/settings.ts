import * as vscode from 'vscode';

export interface ExtensionSettings {
  triggerKey: 'enter' | 'tab' | 'none';
  llmProvider: 'anthropic' | 'openai' | 'ollama' | 'none';
  model: string;
  maxContextLines: number;
  templatesPath: string;
  enableInlinePreview: boolean;
}

export function getSettings(): ExtensionSettings {
  const config = vscode.workspace.getConfiguration('intentCoder');

  return {
    triggerKey: config.get<'enter' | 'tab' | 'none'>('triggerKey', 'enter'),
    llmProvider: config.get<'anthropic' | 'openai' | 'ollama' | 'none'>('llmProvider', 'anthropic'),
    model: config.get<string>('model', 'claude-3-5-sonnet'),
    maxContextLines: config.get<number>('maxContextLines', 10),
    templatesPath: config.get<string>('templatesPath', ''),
    enableInlinePreview: config.get<boolean>('enableInlinePreview', false),
  };
}
