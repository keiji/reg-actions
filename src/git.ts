import * as core from '@actions/core';
import { exec } from '@actions/exec';

interface ExecResult {
  stdout: string;
  stderr: string;
  code: number | null;
}

const capture = async (cmd: string, args: string[]): Promise<ExecResult> => {
  const res: ExecResult = {
    stdout: '',
    stderr: '',
    code: null,
  };

  try {
    const code = await exec(cmd, args, {
      listeners: {
        stdout(data) {
          res.stdout += data.toString();
        },
        stderr(data) {
          res.stderr += data.toString();
        },
      },
    });
    res.code = code;
    return res;
  } catch (err) {
    const msg = `Command '${cmd}' failed with args '${args.join(' ')}': ${res.stderr}: ${err}`;
    core.debug(`@actions/exec.exec() threw an error: ${msg}`);
    throw new Error(msg);
  }
};

export const findTargetHash = async (baseRef: string, headRef: string): Promise<string> => {
  const args = ['merge-base', '-a', `origin/${baseRef}`, `origin/${headRef}`];

  const res = await capture('git', args);

  if (res.code !== 0) {
    throw new Error(`Command 'git ${args.join(' ')}' failed: ${JSON.stringify(res)}`);
  }

  const targetHash = res.stdout.slice(0, 7);
  return targetHash;
};