import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import type {
  ChildProcess,
  IOPayload,
  Command as RealCommand,
} from '@tauri-apps/plugin-shell';

const execFileAsync = promisify(execFile);

const BUNDLED_EXIFTOOL = resolve(
  process.cwd(),
  'src-tauri/resources/exiftool/exiftool',
);

function resolveBinary(name: string): string {
  if (name === 'exiftool') {
    const bin = process.env.EXIFTOOL_PATH ?? BUNDLED_EXIFTOOL;
    if (!existsSync(bin)) {
      throw new Error(
        `exiftool binary not found at ${bin}. Run \`node build-exiftool.ts\` (or set EXIFTOOL_PATH) before running tests.`,
      );
    }
    return bin;
  }
  if (name === 'perl-version') {
    // Capability config allowlist-matches 'perl-version' against an exact cmd+args pattern;
    // the caller must supply those args, and the shim forwards them unchanged to `perl`.
    return 'perl';
  }
  throw new Error(`plugin-shell mock: unknown command name "${name}"`);
}

class Command<O extends IOPayload> {
  private constructor(
    private readonly program: string,
    private readonly args: string[],
  ) {}

  static create<O extends IOPayload>(
    program: string,
    args?: string | string[],
  ): Command<O> {
    const argList =
      args === undefined ? [] : Array.isArray(args) ? args : [args];
    return new Command<O>(program, argList);
  }

  async execute(): Promise<ChildProcess<O>> {
    const bin = resolveBinary(this.program);
    try {
      const { stdout, stderr } = await execFileAsync(bin, this.args, {
        maxBuffer: 64 * 1024 * 1024, // 64 MB — accommodates exiftool JSON output against large RAW image files
      });
      // signal: Node returns a string signal name; the plugin type is `number | null`. No current
      // caller inspects `signal`, so hardcoding null is sufficient for now.
      return {
        code: 0,
        signal: null,
        stdout: stdout as O,
        stderr: stderr as O,
      };
    } catch (err) {
      const e = err as {
        stdout?: string;
        stderr?: string;
        code?: number;
        message?: string;
      };
      return {
        code: typeof e.code === 'number' ? e.code : 1,
        signal: null,
        stdout: (e.stdout ?? '') as O,
        stderr: (e.stderr ?? e.message ?? '') as O,
      };
    }
  }
}

export { Command };

// Static type-drift guard. If @tauri-apps/plugin-shell changes Command.create's return type
// or basic shape, this assignment will fail to compile, alerting us to update the shim.
// Note: generic-arity changes (e.g. adding a type parameter) can slip through unnoticed.
// The shim only implements the base overload (string + optional args); the other
// overloads (sidecar, raw encoding) aren't used by this codebase.
const _createSignatureCheck: typeof RealCommand.create = Command.create;
void _createSignatureCheck;
