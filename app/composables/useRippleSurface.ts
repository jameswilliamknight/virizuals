import { onMounted, onBeforeUnmount, type Ref } from 'vue'
import { createWave, surfaceGrid, waveDuration, sparkleDuration, type RipplePoint, type SurfaceWave } from '../utils/ripple-surface'
import { createRippleRenderer } from '../utils/ripple-surface-renderer'

export function useRippleSurface(canvas: Ref<HTMLCanvasElement | null>) {
  let context: CanvasRenderingContext2D | null = null
  let paint: ReturnType<typeof createRippleRenderer> | undefined
  let grid = surfaceGrid(1, 1), colour = ''
  let waves: SurfaceWave[] = [], pointer: RipplePoint | null = null
  let held: { id: number, point: RipplePoint } | null = null
  let frame = 0, lastDraw = 0, lastMove = 0, hover = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let observer: ResizeObserver | undefined, motion: MediaQueryList | undefined
  let disposed = false
  function schedule() { if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(draw) }
  function draw(now: number) {
    frame = 0
    const delta = lastDraw ? Math.min(50, now - lastDraw) : 0
    lastDraw = now
    const moving = !!pointer && now - lastMove <= 80
    hover = motion?.matches ? Number(moving) : Math.max(0, Math.min(1, hover + (moving ? delta / 220 : -delta / 600)))
    waves = waves.filter(wave => now - wave.started < waveDuration + sparkleDuration)
    paint?.(grid, waves, pointer, hover, colour, now)
    if (waves.length || (pointer && (moving || hover > 0))) schedule()
    else lastDraw = 0
  }
  function point(event: MouseEvent): RipplePoint {
    const bounds = canvas.value!.getBoundingClientRect()
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
  }
  function ripple(at: RipplePoint) {
    if (motion?.matches || disposed || document.hidden) return
    // Lifetime expiry, never a count cap: repeated waves finish naturally.
    waves.push(createWave(at, grid, performance.now()))
    schedule()
  }
  function stop() { clearTimeout(timer); held = null }
  function repeat() {
    timer = setTimeout(() => {
      if (!held || document.hidden || disposed || motion?.matches) { stop(); return }
      ripple(held.point); repeat()
    }, 100 + Math.floor(Math.random() * 151))
  }
  function down(event: PointerEvent) {
    if (event.button !== 0 || motion?.matches) return
    stop()
    held = { id: event.pointerId, point: point(event) }
    repeat()
  }
  function move(event: PointerEvent) {
    if (event.pointerType !== 'touch') { pointer = point(event); lastMove = performance.now(); schedule() }
    if (held?.id === event.pointerId) {
      if (!(event.buttons & 1)) stop()
      else held.point = point(event)
    }
  }
  function leave() { stop(); pointer = null; hover = 0; schedule() }
  function click(event: MouseEvent) { if (event.button === 0) ripple(point(event)) }
  function key(event: KeyboardEvent) {
    if (!['Enter', ' '].includes(event.key) || event.repeat) return
    event.preventDefault()
    ripple({ x: grid.width / 2, y: grid.height / 2 })
  }
  function reset() { stop(); waves = []; pointer = null; hover = 0; lastDraw = 0; schedule() }
  function resize() {
    const element = canvas.value
    if (!element || !context) return
    const bounds = element.getBoundingClientRect()
    grid = surfaceGrid(bounds.width, bounds.height)
    const ratio = Math.min(devicePixelRatio || 1, 2)
    element.width = Math.round(bounds.width * ratio); element.height = Math.round(bounds.height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    colour = getComputedStyle(element).color
    reset()
  }
  onMounted(() => {
    const element = canvas.value
    if (!element) return
    context = element.getContext('2d')
    if (!context) return
    paint = createRippleRenderer(context)
    motion = matchMedia('(prefers-reduced-motion: reduce)')
    motion.addEventListener('change', reset)
    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerleave', leave)
    element.addEventListener('click', click)
    element.addEventListener('keydown', key)
    window.addEventListener('pointerup', stop, true)
    window.addEventListener('pointercancel', stop, true)
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', reset)
    observer = new ResizeObserver(resize)
    observer.observe(element)
    resize()
  })
  onBeforeUnmount(() => {
    disposed = true; stop(); cancelAnimationFrame(frame); observer?.disconnect()
    motion?.removeEventListener('change', reset)
    canvas.value?.removeEventListener('pointerdown', down)
    canvas.value?.removeEventListener('pointermove', move)
    canvas.value?.removeEventListener('pointerleave', leave)
    canvas.value?.removeEventListener('click', click)
    canvas.value?.removeEventListener('keydown', key)
    window.removeEventListener('pointerup', stop, true)
    window.removeEventListener('pointercancel', stop, true)
    window.removeEventListener('blur', reset)
    document.removeEventListener('visibilitychange', reset)
  })
}
