import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const backendRoot = path.join(root, 'backend', 'src');

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(fullPath));
    else if (entry.name.endsWith('.js')) files.push(fullPath);
  }
  return files;
}

const backendFiles = await filesIn(backendRoot);
for (const file of backendFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

const npmCommand = process.platform === 'win32' ? process.env.ComSpec : 'npm';
const npmArgs = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'npm run build --workspace frontend']
  : ['run', 'build', '--workspace', 'frontend'];
const frontend = spawnSync(npmCommand, npmArgs, { stdio: 'inherit', shell: false });
if (frontend.status !== 0) process.exit(frontend.status || 1);
console.log(`Lint passed: ${backendFiles.length} backend files checked and frontend compiled.`);
