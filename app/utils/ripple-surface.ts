export type RipplePoint = { x: number, y: number }
export type RippleGrid = { width: number, height: number, columns: number, rows: number, cellWidth: number }
export const waveDuration = 1200
export const sparkleDuration = 420
export const rainbow = ['#ff7070', '#ffb36b', '#ffe477', '#87e694', '#70d9ed', '#8d9bff', '#d88bfa'] as const
export const waveAge = (elapsed: number) => Math.min(1, Math.floor(Math.max(0, elapsed) * 12 / 1000) * (1000 / 12) / waveDuration)

export function createShape(random = Math.random) {
  return [2, 4, 6].map((frequency, i) => ({ frequency, phase: random() * Math.PI * 2, amplitude: [0.08, 0.045, 0.025][i]! * (0.65 + random() * 0.35) }))
}
export const radiusScale = (angle: number, shape: ReturnType<typeof createShape>) =>
  1 + shape.reduce((sum, wave) => sum + Math.sin(angle * wave.frequency + wave.phase) * wave.amplitude, 0)

export function waveLight(distance: number, reach: number, age: number) {
  const envelope = Math.max(0, 1 - Math.abs(distance - age * reach) / 65) * (1 - age)
  const hue = ((distance * 1.4 - age * 240) % 360 + 360) % 360
  return { strength: Math.round(envelope * 4) / 4 * 0.5, colour: rainbow[Math.floor(hue / 360 * rainbow.length)]! }
}
export function sparkleLight(elapsed: number) {
  if (elapsed < 0 || elapsed >= sparkleDuration) return null
  if (elapsed < 140) return { colour: '#ffe477', strength: 0.85 }
  return { colour: '#70b7ff', strength: elapsed < 280 ? 0.65 : 0.3 }
}
export function surfaceGrid(width: number, height: number): RippleGrid {
  const columns = Math.max(1, Math.floor((width + 4) / 16))
  return { width, height, columns, rows: Math.max(1, Math.floor((height + 3) / 7)), cellWidth: (width - (columns - 1) * 4) / columns }
}
export function cellPoint(grid: RippleGrid, column: number, row: number) {
  return { x: column * (grid.cellWidth + 4), y: grid.height - 4 - row * 7 }
}

/** Stable angular harmonics retain a balanced centre. Sparkles are sampled
 * from visible cells and timed to their intersection with this wavefront. */
export function createWave(origin: RipplePoint, grid: RippleGrid, started: number, random = Math.random) {
  const shape = createShape(random)
  const reach = Math.hypot(Math.max(origin.x, grid.width - origin.x), Math.max(origin.y, grid.height - origin.y)) + 65
  const candidates: Array<{ column: number, row: number, born: number }> = []
  for (let column = 0; column < grid.columns; column++) {
    for (let row = 0; row < grid.rows; row++) {
      const p = cellPoint(grid, column, row)
      const dx = p.x + grid.cellWidth / 2 - origin.x, dy = p.y + 2 - origin.y
      const born = Math.hypot(dx, dy) / (reach * radiusScale(Math.atan2(dy, dx), shape)) * waveDuration
      if (born < waveDuration - 80) candidates.push({ column, row, born })
    }
  }
  const sparkles = Array.from({ length: Math.min(candidates.length, 20 + Math.floor(random() * 31)) }, () => candidates.splice(Math.floor(random() * candidates.length), 1)[0]!)
  return { ...origin, started, shape, reach, sparkles }
}
export type SurfaceWave = ReturnType<typeof createWave>

/** Precompute each wave's segment lighting only at its 12fps tick, not for
 * every hover frame. Fullscreen grids otherwise multiply costly trig work. */
export function sampleWave(wave: SurfaceWave, grid: RippleGrid, age: number) {
  return Array.from({ length: grid.columns * grid.rows }, (_, index) => {
    const p = cellPoint(grid, Math.floor(index / grid.rows), index % grid.rows)
    const dx = p.x + grid.cellWidth / 2 - wave.x, dy = p.y + 2 - wave.y
    return waveLight(Math.hypot(dx, dy), wave.reach * radiusScale(Math.atan2(dy, dx), wave.shape), age)
  })
}
