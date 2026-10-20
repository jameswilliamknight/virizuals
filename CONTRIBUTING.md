# Contributing

Thanks for taking an interest in this little light experiment.

## Keep the idea small

virizuals is a fullscreen visual toy, not a dashboard or an audio analyser. Prefer
changes that improve its feel, accessibility or performance without adding UI.
Open an issue first for a substantial new behaviour or dependency.

## Working on a change

1. Fork and clone the repository. Use Node.js 24 and pnpm 12.4.1.
2. Run `pnpm install`, then `pnpm dev`.
3. Keep the canvas renderer, animation maths and input lifecycle separate.
4. Add behaviour-focused tests for timing, geometry and lifecycle changes.
5. Run `pnpm test`, `pnpm typecheck` and `pnpm build`.
6. For visual changes, include a short recording or before/after screenshots.

Please also check click, hold/release, hover fade-in/out, keyboard input, resize,
tab hiding and reduced motion. Make sure repeated waves finish naturally and
all timers/listeners are cleaned up. Never request microphone access or introduce
analytics as part of a visual enhancement.

Use descriptive commits and keep pull requests focused. Mention what you tested
and any limits of that testing. Contributions are provided under the project's
[MIT licence](LICENSE).
