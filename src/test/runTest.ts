import * as path from 'path';
import * as os from 'os';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // Quote paths to prevent argument splitting on space
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    const tmpUserData = path.join(os.tmpdir(), 'ic-test-user-data');
    const tmpExtensions = path.join(os.tmpdir(), 'ic-test-extensions');

    await runTests({
      extensionDevelopmentPath: `"${extensionDevelopmentPath}"`,
      extensionTestsPath: `"${extensionTestsPath}"`,
      launchArgs: [
        `--user-data-dir="${tmpUserData}"`,
        `--extensions-dir="${tmpExtensions}"`,
        '--disable-gpu',
        '--disable-updates',
      ],
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();
