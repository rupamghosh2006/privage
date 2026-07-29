import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const source = 'contracts/privage.compact';
const output = 'contracts/managed/privage';

if (!existsSync(source)) {
  throw new Error(`Compact source is missing: ${source}`);
}

// Windows' built-in `compact.exe` is unrelated to Midnight Compact. Use WSL or
// set COMPACT_BIN to the Midnight executable when running this command on Windows.
const compiler = process.env.COMPACT_BIN ?? (process.platform === 'win32' ? undefined : 'compact');

if (!compiler) {
  throw new Error(
    'Midnight Compact is not available in native Windows. Run this command from WSL after installing Compact, or set COMPACT_BIN.',
  );
}

const result = spawnSync(compiler, ['compile', source, output], { stdio: 'inherit' });

if (result.error) {
  throw new Error(`Unable to run Midnight Compact: ${result.error.message}`);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

