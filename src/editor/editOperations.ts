import * as vscode from 'vscode';

/**
 * Replaces the active selection in the given editor with the provided text.
 * If there is no selection, it inserts the text at the cursor position.
 */
export async function replaceSelection(editor: vscode.TextEditor, text: string): Promise<boolean> {
  return editor.edit((editBuilder) => {
    editBuilder.replace(editor.selection, text);
  });
}
