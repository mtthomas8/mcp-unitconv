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

test('--list-units groups indented units under a dimension header', () => {
  const { out, lines } = capture();
  const code = run(['--list-units'], out);
  assert.equal(code, 0);

  const lengthAt = lines.log.indexOf('length:');
  const massAt = lines.log.indexOf('mass:');
  assert.ok(lengthAt >= 0);
  assert.ok(massAt > lengthAt);
  assert.ok(lines.log.indexOf('  km') > lengthAt);
  assert.ok(lines.log.indexOf('  km') < massAt);
  assert.ok(lines.log.indexOf('  kg') > massAt);
  assert.ok(lines.log.includes('temperature:'));
  assert.ok(lines.log.includes('  C'));
});

test('--list-units separates groups with a blank line and sorts within each', () => {
  const { out, lines } = capture();
  run(['--list-units'], out);

  const headers = lines.log.filter((line) => line.endsWith(':'));
  assert.equal(lines.log.filter((line) => line === '').length, headers.length - 1);

  let group: string[] = [];
  for (const line of [...lines.log, '']) {
    if (line.startsWith('  ')) {
      group.push(line);
    } else {
      assert.deepEqual(group, [...group].sort());
      group = [];
    }
  }
});

test('-u is a shorthand for --list-units', () => {
  const { out, lines } = capture();
  const code = run(['-u'], out);
  assert.equal(code, 0);
  assert.ok(lines.log.includes('  kg'));
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
