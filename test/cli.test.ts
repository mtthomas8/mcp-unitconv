import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run } from '../src/cli.ts';

function capture() {
  const lines: { log: string[]; error: string[] } = { log: [], error: [] };
  return {
    out: {
      log: (line: string) => lines.log.push(line),
      error: (line: string) => lines.error.push(line),
    },
    lines,
  };
}

test('prints the converted value', () => {
  const { out, lines } = capture();
  const code = run(['100', 'C', 'F'], out);
  assert.equal(code, 0);
  assert.deepEqual(lines.log, ['212']);
});

test('prints usage with no arguments', () => {
  const { out, lines } = capture();
  const code = run([], out);
  assert.equal(code, 0);
  assert.equal(lines.log.length, 1);
  assert.match(lines.log[0], /usage: unitconv/);
});

test('prints usage with --help', () => {
  const { out, lines } = capture();
  const code = run(['--help'], out);
  assert.equal(code, 0);
  assert.match(lines.log[0], /usage: unitconv/);
});

test('lists units one per line with --list-units', () => {
  const { out, lines } = capture();
  const code = run(['--list-units'], out);
  assert.equal(code, 0);
  assert.ok(lines.log.length > 1);
  assert.ok(lines.log.includes('km'));
  assert.ok(lines.log.includes('C'));
  assert.deepEqual(lines.log, [...lines.log].sort());
});

test('-u is a shorthand for --list-units', () => {
  const { out, lines } = capture();
  const code = run(['-u'], out);
  assert.equal(code, 0);
  assert.ok(lines.log.includes('kg'));
});

test('rejects the wrong number of arguments', () => {
  const { out, lines } = capture();
  const code = run(['1', 'km'], out);
  assert.equal(code, 1);
  assert.match(lines.error[0], /usage: unitconv/);
});

test('reports conversion errors from convert()', () => {
  const { out, lines } = capture();
  const code = run(['1', 'km', 'kg'], out);
  assert.equal(code, 1);
  assert.match(lines.error[0], /dimension mismatch/);
});
