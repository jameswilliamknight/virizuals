import { describe, expect, it } from 'vitest'
import { createShape, radiusScale, createWave, surfaceGrid, waveAge, waveLight, rainbow, sparkleLight } from '../app/utils/ripple-surface'

describe('fullscreen ripple primitives', () => {
  it('keeps whole cells and fits both desktop and narrow screens', () => {
    for (const width of [390, 1280]) {
      const grid = surfaceGrid(width, 900)
      expect(grid.cellWidth * grid.columns + (grid.columns - 1) * 4).toBeCloseTo(width)
      expect(grid.rows * 7 - 3).toBeLessThanOrEqual(900)
    }
  })
  it('holds 12fps poses and quantises colours and brightness', () => {
    expect(waveAge(100)).toBe(waveAge(160))
    expect(waveAge(170)).toBeGreaterThan(waveAge(160))
    for (let distance = 0; distance < 800; distance += 5) {
      const light = waveLight(distance, 800, waveAge(300))
      expect([0, 0.125, 0.25, 0.375, 0.5]).toContain(light.strength)
      expect(rainbow).toContain(light.colour)
    }
  })
  it('keeps irregular radii balanced and chooses 20–50 unique sparkles', () => {
    const shape = createShape(() => 0.4)
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      expect(radiusScale(angle, shape)).toBeCloseTo(radiusScale(angle + Math.PI, shape), 10)
      expect(radiusScale(angle, shape)).toBeGreaterThanOrEqual(0.85)
      expect(radiusScale(angle, shape)).toBeLessThanOrEqual(1.15)
    }
    for (const random of [() => 0, () => 0.999]) {
      const wave = createWave({ x: 200, y: 100 }, surfaceGrid(1280, 900), 0, random)
      expect(wave.sparkles).toHaveLength(random() === 0 ? 20 : 50)
      expect(new Set(wave.sparkles.map(s => `${s.column},${s.row}`)).size).toBe(wave.sparkles.length)
    }
    expect(sparkleLight(0)?.colour).toBe('#ffe477')
    expect(sparkleLight(150)?.colour).toBe('#70b7ff')
    expect(sparkleLight(420)).toBeNull()
  })
})
