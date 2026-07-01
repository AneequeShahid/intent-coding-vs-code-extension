import * as assert from 'assert';
import * as vscode from 'vscode';
import { setTestSettingsOverride } from '../../config/settings';

suite('VS Code Integration Tests', () => {
  vscode.window.showInformationMessage('Start all integration tests.');

  suiteSetup(async () => {
    setTestSettingsOverride({ enableInlinePreview: false });
  });

  test('should resolve line templates and support single-step undo', async () => {
    // 1. Open a new C++ document
    const doc = await vscode.workspace.openTextDocument({
      language: 'cpp',
      content: 'fast io',
    });
    const editor = await vscode.window.showTextDocument(doc);

    // Position cursor at the end of the line
    const endPosition = new vscode.Position(0, 7);
    editor.selection = new vscode.Selection(endPosition, endPosition);

    // 2. Execute resolveLine command
    await vscode.commands.executeCommand('intentCoder.resolveLine');

    // Verify it resolved to C++ Fast IO snippet
    const textAfterResolve = doc.getText();
    assert.ok(
      textAfterResolve.includes('ios_base::sync_with_stdio(false)'),
      `Expected text to contain C++ Fast IO, but got:\n${textAfterResolve}`
    );

    // 3. Test single-step undo
    await vscode.commands.executeCommand('undo');
    assert.strictEqual(doc.getText(), 'fast io');

    // 4. Test fuzzy matching for "dfs skeletn" (typo)
    await editor.edit((editBuilder) => {
      editBuilder.replace(new vscode.Range(0, 0, 0, doc.getText().length), 'dfs skeletn');
    });
    editor.selection = new vscode.Selection(new vscode.Position(0, 11), new vscode.Position(0, 11));

    await vscode.commands.executeCommand('intentCoder.resolveLine');

    const textAfterFuzzy = doc.getText();
    assert.ok(
      textAfterFuzzy.includes('void dfs('),
      `Expected text to contain DFS template, but got:\n${textAfterFuzzy}`
    );
  });

  test('should show inline suggest ghost text when enableInlinePreview is true', async () => {
    setTestSettingsOverride({ enableInlinePreview: true });

    try {
      const doc = await vscode.workspace.openTextDocument({
        language: 'cpp',
        content: 'fast io',
      });
      const editor = await vscode.window.showTextDocument(doc);
      editor.selection = new vscode.Selection(new vscode.Position(0, 7), new vscode.Position(0, 7));

      // 2. Resolve line (should trigger preview, not modify document immediately)
      await vscode.commands.executeCommand('intentCoder.resolveLine');

      // Wait for inline completion to register and render ghost text
      await new Promise((resolve) => setTimeout(resolve, 1000));
      assert.strictEqual(doc.getText(), 'fast io');

      // 3. Commit suggestion (retry loop)
      for (let i = 0; i < 15; i++) {
        await vscode.commands.executeCommand('editor.action.inlineSuggest.commit');
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (doc.getText().includes('ios_base::sync_with_stdio(false)')) {
          break;
        }
      }

      assert.ok(
        doc.getText().includes('ios_base::sync_with_stdio(false)'),
        `Expected text to contain Fast IO after commit, but got:\n${doc.getText()}`
      );
    } finally {
      setTestSettingsOverride(undefined);
    }
  });
});
