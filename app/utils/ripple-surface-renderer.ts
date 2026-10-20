import { cellPoint, sampleWave, sparkleLight, waveAge, type RippleGrid, type RipplePoint, type SurfaceWave } from './ripple-surface'

export function createRippleRenderer(context: CanvasRenderingContext2D) {
  const cache = new WeakMap<SurfaceWave, { age: number, grid: RippleGrid, lights: ReturnType<typeof sampleWave> }>()
  return (grid: RippleGrid, waves: SurfaceWave[], pointer: RipplePoint | null, hover: number, colour: string, now: number) => {
    context.clearRect(0, 0, grid.width, grid.height)
    context.globalAlpha = 0.015
    context.fillStyle = colour
    context.shadowBlur = 0
    for (let column = 0; column < grid.columns; column++) {
      for (let row = 0; row < grid.rows; row++) {
        const p = cellPoint(grid, column, row)
        context.fillRect(p.x, p.y, grid.cellWidth, 4)
      }
    }
    const samples = waves.map(wave => {
      const age = waveAge(now - wave.started)
      let cached = cache.get(wave)
      if (!cached || cached.age !== age || cached.grid !== grid) {
        cached = { age, grid, lights: sampleWave(wave, grid, age) }
        cache.set(wave, cached)
      }
      return cached.lights
    })
    for (let column = 0; column < grid.columns; column++) {
      for (let row = 0; row < grid.rows; row++) {
        const p = cellPoint(grid, column, row)
        const proximity = pointer ? Math.max(0, 1 - Math.hypot(p.x + grid.cellWidth / 2 - pointer.x, p.y + 2 - pointer.y) / 190) : 0
        let strength = Math.round(proximity ** 2 * 4) / 4 * 0.2 * hover
        let tint = colour
        for (const lights of samples) {
          const light = lights[column * grid.rows + row]!
          if (light.strength > strength) { strength = light.strength; tint = light.colour }
        }
        if (strength < 0.015) continue
        context.globalAlpha = strength
        context.fillStyle = tint
        context.shadowColor = tint
        context.shadowBlur = 12 * strength
        context.fillRect(p.x, p.y, grid.cellWidth, 4)
      }
    }
    for (const wave of waves) {
      for (const sparkle of wave.sparkles) {
        const light = sparkleLight(now - wave.started - sparkle.born)
        if (!light) continue
        const p = cellPoint(grid, sparkle.column, sparkle.row)
        context.globalAlpha = light.strength
        context.fillStyle = light.colour
        context.shadowColor = light.colour
        context.shadowBlur = 8
        context.fillRect(p.x, p.y, grid.cellWidth, 4)
      }
    }
    context.globalAlpha = 1
    context.shadowBlur = 0
  }
}
