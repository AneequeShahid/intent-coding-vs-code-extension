import * as vscode from 'vscode';

const API_KEY_SECRET_KEY = 'intentCoder.anthropicApiKey';

export class ApiKeyStore {
  constructor(private readonly secrets: vscode.SecretStorage) {}

  public async getApiKey(): Promise<string | undefined> {
    return this.secrets.get(API_KEY_SECRET_KEY);
  }

  public async setApiKey(key: string): Promise<void> {
    await this.secrets.store(API_KEY_SECRET_KEY, key);
  }

  public async deleteApiKey(): Promise<void> {
    await this.secrets.delete(API_KEY_SECRET_KEY);
  }
}
