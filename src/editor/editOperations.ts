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

/**
 * Replaces the entire current line (from column 0 to line end) in the given editor with newText.
 * Does NOT add a trailing newline.
 * Moves the cursor to the end of the inserted text.
 */
export async function replaceCurrentLine(editor: vscode.TextEditor, newText: string): Promise<void> {
  const position = editor.selection.active;
  const line = editor.document.lineAt(position.line);
  const range = new vscode.Range(position.line, 0, position.line, line.text.length);

  await editor.edit((editBuilder) => {
    editBuilder.replace(range, newText);
  });

  const newPosition = new vscode.Position(position.line, newText.length);
  editor.selection = new vscode.Selection(newPosition, newPosition);
}
