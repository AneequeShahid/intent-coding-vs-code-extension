import * as vscode from 'vscode';
import { replaceSelection } from '../editor/editOperations';
import { SupportedLanguage } from '../templates/schema';
import { ApiKeyStore } from '../secrets/apiKeyStore';
import { AnthropicProvider } from '../llm/anthropicProvider';
import { setStatusBarInFlight, updateStatusBar } from '../ui/statusBar';

let explainChannel: vscode.OutputChannel | undefined;

export function registerSelectionMenu(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('intentCoder.selectionMenu', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active text editor found.');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    if (!selectedText || selectedText.trim() === '') {
      vscode.window.showInformationMessage('Please select some code first.');
      return;
    }

    const vscodeLang = editor.document.languageId;
    const lang = mapLanguageId(vscodeLang);
    if (!lang) {
      vscode.window.showWarningMessage(`Language "${vscodeLang}" is not supported.`);
      return;
    }

    const items: vscode.QuickPickItem[] = [
      {
        label: 'Convert to range loop',
        description: 'Transforms standard loops into range-based loops',
      },
      {
        label: 'Split into function',
        description: 'Extracts the selected code into a separate function helper',
      },
      {
        label: 'Add comments',
        description: 'Adds clean, explanatory inline comments to the selection',
      },
      {
        label: 'Optimize',
        description: 'Refactors selected code for better time/space efficiency',
      },
      {
        label: 'Translate to another language',
        description: 'Converts selection to a target programming language',
      },
      {
        label: 'Explain',
        description: 'Explains the selected code in an output panel',
      },
    ];

    const choice = await vscode.window.showQuickPick(items, {
      placeHolder: `Selection Action Menu (${lang}) - Choose an action`,
    });

    if (!choice) {
      return;
    }

    const apiKeyStore = new ApiKeyStore(context.secrets);
    const provider = new AnthropicProvider(apiKeyStore);

    const isConfigured = await provider.isConfigured();
    if (!isConfigured) {
      vscode.window.showWarningMessage(
        'LLM provider is not configured. Please set your Anthropic API key to run selection menu actions.'
      );
      return;
    }

    let finalAction = choice.label;
    let targetLang = lang;

    if (choice.label === 'Translate to another language') {
      const languages: { label: string; id: SupportedLanguage }[] = [
        { label: 'C++', id: 'cpp' },
        { label: 'Python', id: 'python' },
        { label: 'Java', id: 'java' },
        { label: 'Rust', id: 'rust' },
        { label: 'JavaScript', id: 'javascript' },
        { label: 'TypeScript', id: 'typescript' },
      ];
      
      const langChoice = await vscode.window.showQuickPick(languages, {
        placeHolder: 'Select target language for translation',
      });
      
      if (!langChoice) {
        return;
      }
      targetLang = langChoice.id;
      finalAction = `Translate selection from ${lang} to ${langChoice.id}`;
    }

    setStatusBarInFlight();
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Intent Coder: Running "${choice.label}"...`,
        cancellable: false,
      },
      async () => {
        try {
          const response = await provider.generate({
            sourceText: selectedText,
            language: targetLang,
            action: finalAction,
          });

          if (choice.label === 'Explain') {
            if (!explainChannel) {
              explainChannel = vscode.window.createOutputChannel('Intent Coder Explanation');
            }
            explainChannel.clear();
            explainChannel.appendLine(`=== CODE EXPLANATION ===\n`);
            explainChannel.appendLine(response.code);
            explainChannel.show();
          } else {
            await replaceSelection(editor, response.code);
          }
        } catch (err: any) {
          vscode.window.showErrorMessage(`Action failed: ${err.message}`);
        } finally {
          await updateStatusBar(context.secrets);
        }
      }
    );
  });
}

function mapLanguageId(languageId: string): SupportedLanguage | undefined {
  const map: Record<string, SupportedLanguage> = {
    'cpp': 'cpp',
    'python': 'python',
    'java': 'java',
    'rust': 'rust',
    'javascript': 'javascript',
    'typescript': 'typescript',
  };
  return map[languageId];
}
