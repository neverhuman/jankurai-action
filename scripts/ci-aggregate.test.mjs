import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const workflow = fs.readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const required = workflow.slice(workflow.indexOf('\n  required:\n'));
const command = required.match(/^        run: (jq .+)$/m)?.[1];
assert.ok(command, 'exercise the actual required-job jq command');

function aggregate(value) {
  const result = spawnSync('bash', ['-euo', 'pipefail', '-c', command], {
    encoding: 'utf8', env: { PATH: process.env.PATH, NEEDS_JSON: value },
  });
  assert.ifError(result.error);
  return result.status === 0;
}

const success = { result: 'success', outputs: {} };
const lanes = ['contracts', 'public-audit', 'public-positive'];
const successfulJobs = Object.fromEntries(lanes.map(lane => [lane, success]));
test('all successful required jobs pass regardless of key order', () => {
  assert.equal(aggregate(JSON.stringify(successfulJobs)), true);
  assert.equal(aggregate(JSON.stringify(Object.fromEntries(Object.entries(successfulJobs).reverse()))), true);
});

for (const [name, value] of [
  ['empty object', '{}'], ['empty array', '[]'], ['null', 'null'],
  ['string', '"success"'], ['boolean', 'true'], ['number', '0'],
  ['missing input', ''], ['malformed JSON', '{'],
  ['multiple JSON values', '{}\n{}'],
  ['missing contracts', JSON.stringify({ 'public-audit': success })],
  ['missing public audit', JSON.stringify({ contracts: success })],
  ['renamed job', JSON.stringify({ contracts: success, audit: success })],
  ['extra job', JSON.stringify({ ...successfulJobs, extra: success })],
  ['successful array', JSON.stringify([success, success])],
]) {
  test(`required aggregate rejects ${name}`, () => assert.equal(aggregate(value), false));
}

for (const lane of lanes) {
  test(`required aggregate rejects missing ${lane}`, () => {
    const jobs = { ...successfulJobs };
    delete jobs[lane];
    assert.equal(aggregate(JSON.stringify(jobs)), false);
  });
  for (const value of [null, [], 'success', {}, { result: true }, { result: 0 },
    ...['failure', 'cancelled', 'skipped', 'pending', 'neutral', 'timed_out'].map(result => ({ result }))]) {
    test(`required aggregate rejects ${lane} outcome ${JSON.stringify(value)}`, () => {
      const jobs = { ...successfulJobs, [lane]: value };
      assert.equal(aggregate(JSON.stringify(jobs)), false);
    });
  }
}

function assertWorkflowLanes(source) {
  // Keep this deliberately narrow: a workflow layout change requires review.
  const jobs = [...source.matchAll(/^  ([\w-]+):$/gm)].map(match => match[1]);
  assert.deepEqual(jobs, ['push', 'pull_request', ...lanes, 'required']);
  assert.match(source, /^    needs: \[contracts, public-audit, public-positive\]$/m);
  assert.match(source, /^    if: always\(\)$/m);
  assert.equal([...source.matchAll(/^        floor: \['85', '90'\]$/gm)].length, 2);
}

test('workflow retains every dependency and both floors in each public matrix', () => {
  assertWorkflowLanes(workflow);
});

test('workflow mutations removing a dependency, job or matrix floor are rejected', () => {
  for (const changed of [
    workflow.replace('needs: [contracts, public-audit, public-positive]', 'needs: [contracts]'),
    workflow.replace('needs: [contracts, public-audit, public-positive]', 'needs: [public-audit]'),
    workflow.replace(/\n  contracts:\n[\s\S]*?(?=\n  public-audit:)/, ''),
    workflow.replace(/\n  public-audit:\n[\s\S]*?(?=\n  public-positive:)/, ''),
    workflow.replace(/\n  public-positive:\n[\s\S]*?(?=\n  required:)/, ''),
    workflow.replace('needs: [contracts, public-audit, public-positive]', 'needs: [contracts, public-audit]'),
    workflow.replace("floor: ['85', '90']", "floor: ['85']"),
    workflow.replace("floor: ['85', '90']", "floor: ['90']"),
    workflow.replace(/^    if: always\(\)\n/m, ''),
  ]) {
    assert.notEqual(changed, workflow);
    assert.throws(() => assertWorkflowLanes(changed));
  }
});
