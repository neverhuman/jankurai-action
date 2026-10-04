import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runner = path.join(root, 'scripts/ci-local.sh');
const LANES = ['required', 'fast', 'security', 'audit', 'gates'];

// The lanes themselves are not run here: `required` is this test's own caller.
// The contract under test is the dispatch surface tooling and agents rely on.
test('unknown lanes exit 2 with a usage line naming every lane', () => {
  const result = spawnSync('bash', [runner, 'bogus'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /^usage: .*ci-local\.sh \{required\|fast\|security\|audit\|gates\}$/m);
  for (const lane of LANES) assert.ok(result.stderr.includes(lane), `usage omits ${lane}`);
});

test('every documented lane is dispatched and required is the default', () => {
  const source = fs.readFileSync(runner, 'utf8');
  for (const lane of LANES) assert.match(source, new RegExp(`^\\s*${lane}\\)`, 'm'), `no case branch for ${lane}`);
  assert.match(source, /lane="\$\{1:-required\}"/);
  assert.match(source, /^set -euo pipefail$/m);
});

test('the required lane installs from the lockfile without running scripts', () => {
  const source = fs.readFileSync(runner, 'utf8');
  assert.match(source, /npm ci --ignore-scripts --no-audit --no-fund/);
  assert.match(source, /^\s*required\) install_deps; unit ;;$/m);
});

test('the test map names the required lane for the repository root', () => {
  const map = JSON.parse(fs.readFileSync(path.join(root, 'agent/test-map.json'), 'utf8'));
  assert.equal(map.workspace, 'jankurai-action');
  assert.equal(map.tests['.'].command, 'bash scripts/ci-local.sh required');
  for (const [zone, entry] of Object.entries(map.tests)) {
    assert.ok(typeof entry.purpose === 'string' && entry.purpose.length > 0, `${zone} has no purpose`);
    assert.match(entry.command, /^bash scripts\/ci-local\.sh (?:required|fast|security|audit|gates)$/);
    assert.ok(zone === '.' || fs.existsSync(path.join(root, zone)), `${zone} does not exist`);
  }
});

test('the runner is an executable bash script', () => {
  assert.ok(fs.statSync(runner).mode & 0o111);
  assert.match(fs.readFileSync(runner, 'utf8'), /^#!\/usr\/bin\/env bash\n/);
});
