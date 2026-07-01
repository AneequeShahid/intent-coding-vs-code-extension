import * as vscode from 'vscode';

interface PendingPreview {
  documentUri: string;
  line: number;
  code: string;
  originalLineLength: number;
}

let pendingPreview: PendingPreview | undefined;

export class IntentCoderInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _context: vscode.InlineCompletionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.InlineCompletionList | vscode.InlineCompletionItem[]> {
    if (!pendingPreview) {
      return undefined;
    }

    if (
      document.uri.toString() !== pendingPreview.documentUri ||
      position.line !== pendingPreview.line
    ) {
      return undefined;
    }

    const insertPos = new vscode.Position(pendingPreview.line, pendingPreview.originalLineLength);
    const completionItem = new vscode.InlineCompletionItem(
      pendingPreview.code,
      new vscode.Range(insertPos, insertPos)
    );

    completionItem.command = {
      command: 'intentCoder.cleanInlinePrefix',
      title: 'Clean Inline Prefix',
      arguments: [document.uri, pendingPreview.line, pendingPreview.originalLineLength]
    };

    return [completionItem];
  }
}

export function showInlinePreview(document: vscode.TextDocument, line: number, code: string): void {
  pendingPreview = {
    documentUri: document.uri.toString(),
    line,
    code,
    originalLineLength: document.lineAt(line).text.length
  };
  vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
}

export function clearInlinePreview(): void {
  pendingPreview = undefined;
}

export function activateInlinePreview(context: vscode.ExtensionContext): void {
  const provider = new IntentCoderInlineCompletionProvider();
  context.subscriptions.push(
    vscode.languages.registerInlineCompletionItemProvider(
      { pattern: '**' },
      provider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('intentCoder.cleanInlinePrefix', async (uri: vscode.Uri, lineNum: number, length: number) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.uri.toString() === uri.toString()) {
        await editor.edit((editBuilder) => {
          editBuilder.delete(new vscode.Range(
            new vscode.Position(lineNum, 0),
            new vscode.Position(lineNum, length)
          ));
        });
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => {
      clearInlinePreview();
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      if (pendingPreview && e.selections[0] && e.selections[0].active.line !== pendingPreview.line) {
        clearInlinePreview();
      }
    })
  );
}
