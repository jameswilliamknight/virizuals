import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const fixtures: string[] = []
afterEach(() => { for (const path of fixtures.splice(0)) rmSync(path, { recursive: true, force: true }) })
function launch(args: string[]) {
  const root = mkdtempSync(join(tmpdir(), 'virizuals-launcher-'))
  fixtures.push(root)
  writeFileSync(join(root, 'pnpm'), '#!/bin/sh\nprintf "%s\\n" "$@"\n', { mode: 0o755 })
  symlinkSync(resolve('bin/virizuals'), join(root, 'virizuals'))
  return spawnSync('bash', [join(root, 'virizuals'), ...args], { cwd: root, env: { ...process.env, PATH: `${root}:${process.env.PATH}` }, encoding: 'utf8' })
}
describe('virizuals launcher', () => {
  it('passes explicit takeover through and supports headless in either order', () => {
    for (const args of [['--takeover'], ['--headless', '--takeover'], ['--takeover', '--headless']]) {
      const result = launch(args)
      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout.split('\n')).toContain('--takeover')
      expect(result.stdout).not.toContain('--no-takeover')
      expect(result.stdout.includes('--open')).toBe(!args.includes('--headless'))
    }
  })
  it('keeps default launch non-destructive and rejects unknown options', () => {
    expect(launch([]).stdout.split('\n')).toContain('--no-takeover')
    expect(launch(['--unknown']).status).toBe(2)
  })
})
