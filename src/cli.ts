#!/usr/bin/env node
import { convert, supportedUnits } from './units.ts';

interface Output {
  log: (line: string) => void;
  error: (line: string) => void;
}

function usage(): string {
  return [
    'usage: unitconv <value> <from> <to>',
    '       unitconv --list-units | -u',
    '',
    'example: unitconv 100 C F',
    '',
    `supported units: ${supportedUnits().sort().join(', ')}`,
  ].join('\n');
}

/** Runs the CLI against a raw argv slice, returning the process exit code. */
export function run(argv: string[], out: Output = console): number {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    out.log(usage());
    return 0;
  }

  if (argv[0] === '--list-units' || argv[0] === '-u') {
    for (const unit of supportedUnits().sort()) out.log(unit);
    return 0;
  }

  if (argv.length !== 3) {
    out.error(usage());
    return 1;
  }

  const [rawValue, from, to] = argv;
  try {
    const result = convert(Number(rawValue), from, to);
    out.log(String(result.value));
    return 0;
  } catch (err) {
    out.error(err instanceof Error ? err.message : String(err));
    return 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = run(process.argv.slice(2));
}
