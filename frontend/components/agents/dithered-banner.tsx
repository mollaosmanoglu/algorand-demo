"use client"

import { useRef, useEffect, useCallback } from "react"

// --- Image processing ---

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function processImage(
  img: HTMLImageElement,
  maxDimension: number,
  contrast: number,
  gamma: number,
  blur: number,
) {
  const aspect = img.naturalWidth / img.naturalHeight
  let outW: number, outH: number
  if (aspect >= 1) {
    outW = maxDimension
    outH = Math.round(maxDimension / aspect)
  } else {
    outH = maxDimension
    outW = Math.round(maxDimension * aspect)
  }

  const srcW = img.naturalWidth
  const srcH = img.naturalHeight

  const alphaCanvas = document.createElement("canvas")
  alphaCanvas.width = outW
  alphaCanvas.height = outH
  const alphaCtx = alphaCanvas.getContext("2d")!
  alphaCtx.imageSmoothingEnabled = true
  alphaCtx.imageSmoothingQuality = "high"
  alphaCtx.drawImage(img, 0, 0, outW, outH)
  const alphaData = alphaCtx.getImageData(0, 0, outW, outH).data

  const pad = Math.ceil(blur * 3)
  const srcCanvas = document.createElement("canvas")
  srcCanvas.width = srcW + pad * 2
  srcCanvas.height = srcH + pad * 2
  const srcCtx = srcCanvas.getContext("2d")!
  if (blur > 0) srcCtx.filter = `blur(${blur}px)`
  srcCtx.drawImage(img, pad, pad, srcW, srcH)
  srcCtx.filter = "none"

  const canvas = document.createElement("canvas")
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext("2d")!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(srcCanvas, pad, pad, srcW, srcH, 0, 0, outW, outH)

  const pixels = ctx.getImageData(0, 0, outW, outH).data
  const grayscale = new Uint8Array(outW * outH)
  const alpha = new Uint8Array(outW * outH)

  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const idx = (y * outW + x) * 4
      const r = pixels[idx]
      const g = pixels[idx + 1]
      const b = pixels[idx + 2]
      const blurredAlpha = pixels[idx + 3] / 255

      alpha[y * outW + x] = alphaData[idx + 3]

      let luma: number
      if (blurredAlpha > 0.01) {
        luma = (0.299 * r + 0.587 * g + 0.114 * b) / blurredAlpha
      } else {
        luma = 0
      }

      if (contrast !== 0) luma = contrastFactor * (luma - 128) + 128
      if (gamma !== 1.0) luma = 255 * Math.pow(Math.max(0, luma / 255), 1 / gamma)

      grayscale[y * outW + x] = Math.max(0, Math.min(255, Math.round(luma)))
    }
  }

  return { grayscale, alpha, width: outW, height: outH }
}

// --- Floyd-Steinberg dithering ---

function floydSteinberg(
  grayscale: Uint8Array,
  width: number,
  height: number,
  threshold: number,
  alpha: Uint8Array,
) {
  const errors = new Float32Array(width * height)
  for (let i = 0; i < grayscale.length; i++) errors[i] = grayscale[i]

  const positions: number[] = []

  for (let y = 0; y < height; y++) {
    const leftToRight = y % 2 === 0
    const startX = leftToRight ? 0 : width - 1
    const endX = leftToRight ? width : -1
    const step = leftToRight ? 1 : -1

    for (let x = startX; x !== endX; x += step) {
      const idx = y * width + x
      if (alpha[idx] < 128) continue

      const oldVal = errors[idx]
      const newVal = oldVal > threshold ? 255 : 0
      const err = oldVal - newVal

      if (newVal > 0) positions.push(x, y)

      const diffuse = (nx: number, ny: number, weight: number) => {
        if (nx < 0 || nx >= width || ny >= height) return
        const ni = ny * width + nx
        if (alpha[ni] < 128) return
        errors[ni] += err * weight
      }

      diffuse(x + step, y, 7 / 16)
      diffuse(x - step, y + 1, 3 / 16)
      diffuse(x, y + 1, 5 / 16)
      diffuse(x + step, y + 1, 1 / 16)
    }
  }

  return new Float32Array(positions)
}

// --- Particle system ---

interface DotSystem {
  count: number
  baseX: Float32Array
  baseY: Float32Array
  dx: Float32Array
  dy: Float32Array
  size: number
}

interface Shockwave {
  x: number
  y: number
  start: number
}

const SHOCKWAVE_SPEED = 225
const SHOCKWAVE_WIDTH = 37
const SHOCKWAVE_STRENGTH = 20
const SHOCKWAVE_DURATION = 675
const MOUSE_RADIUS = 80
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS
const MOUSE_FORCE_PEAK = 35
const EASING = 0.12
const SNAP_THRESHOLD = 0.01

function createDotSystem(
  points: Float32Array,
  scaleFactor: number,
  dotScale: number,
  offsetX: number,
  offsetY: number,
): DotSystem {
  const count = points.length / 2
  const baseX = new Float32Array(count)
  const baseY = new Float32Array(count)
  const dx = new Float32Array(count)
  const dy = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    baseX[i] = offsetX + points[i * 2] * scaleFactor
    baseY[i] = offsetY + points[i * 2 + 1] * scaleFactor
  }

  return { count, baseX, baseY, dx, dy, size: scaleFactor * dotScale }
}

function updateDots(
  sys: DotSystem,
  mouseX: number,
  mouseY: number,
  mouseActive: boolean,
  shockwaves: Shockwave[],
  now: number,
): boolean {
  const { count, baseX, baseY, dx, dy } = sys

  for (let k = shockwaves.length - 1; k >= 0; k--) {
    if (now - shockwaves[k].start >= SHOCKWAVE_DURATION) shockwaves.splice(k, 1)
  }

  let hasMotion = false

  for (let i = 0; i < count; i++) {
    let targetFx = 0
    let targetFy = 0

    if (mouseActive) {
      const vx = baseX[i] + dx[i] - mouseX
      const vy = baseY[i] + dy[i] - mouseY
      const dist2 = vx * vx + vy * vy

      if (dist2 > 0.1 && dist2 < MOUSE_RADIUS_SQ) {
        const dist = Math.sqrt(dist2)
        const falloff = 1 - dist / MOUSE_RADIUS
        const force = falloff * falloff * falloff * MOUSE_FORCE_PEAK
        targetFx += (vx / dist) * force
        targetFy += (vy / dist) * force
      }
    }

    for (let k = 0; k < shockwaves.length; k++) {
      const sw = shockwaves[k]
      const elapsed = now - sw.start
      const radius = (elapsed / 1000) * SHOCKWAVE_SPEED
      const life = 1 - elapsed / SHOCKWAVE_DURATION

      const sx = baseX[i] - sw.x
      const sy = baseY[i] - sw.y
      const dist = Math.sqrt(sx * sx + sy * sy)

      if (dist >= 0.1) {
        const band = Math.abs(dist - radius)
        if (band < SHOCKWAVE_WIDTH) {
          const waveForce = (1 - band / SHOCKWAVE_WIDTH) * life * SHOCKWAVE_STRENGTH
          targetFx += (sx / dist) * waveForce
          targetFy += (sy / dist) * waveForce
        }
      }
    }

    dx[i] += (targetFx - dx[i]) * EASING
    dy[i] += (targetFy - dy[i]) * EASING
    if (Math.abs(dx[i]) < SNAP_THRESHOLD) dx[i] = 0
    if (Math.abs(dy[i]) < SNAP_THRESHOLD) dy[i] = 0
    if (dx[i] !== 0 || dy[i] !== 0) hasMotion = true
  }

  return hasMotion || shockwaves.length > 0 || mouseActive
}

function renderDots(
  ctx: CanvasRenderingContext2D,
  sys: DotSystem,
  canvasW: number,
  canvasH: number,
  dpr: number,
  dotColor: string,
) {
  ctx.clearRect(0, 0, canvasW * dpr, canvasH * dpr)
  ctx.fillStyle = dotColor

  const size = sys.size * dpr
  const pad = 0.25 * dpr
  const padSize = 0.5 * dpr

  for (let i = 0; i < sys.count; i++) {
    const rx = (sys.baseX[i] + sys.dx[i]) * dpr
    const ry = (sys.baseY[i] + sys.dy[i]) * dpr
    ctx.fillRect(rx - pad, ry - pad, size + padSize, size + padSize)
  }
}

// --- Component ---

const GRID_SIZE = 160

interface DitheredBannerProps {
  src: string
  className?: string
  dotColor?: string
  bgColor?: string
}

export function DitheredBanner({
  src,
  className = "",
  dotColor = "rgba(0,0,0,0.85)",
  bgColor = "#f4f4f5",
}: DitheredBannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const systemRef = useRef<DotSystem | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const shockwavesRef = useRef<Shockwave[]>([])
  const animFrameRef = useRef<number>(0)
  const runningRef = useRef(false)

  const startLoop = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const dpr = window.devicePixelRatio || 1

    const tick = () => {
      const sys = systemRef.current
      if (!sys) {
        runningRef.current = false
        return
      }

      const rect = canvas.getBoundingClientRect()
      const needsMore = updateDots(
        sys,
        mouseRef.current.x,
        mouseRef.current.y,
        mouseRef.current.active,
        shockwavesRef.current,
        performance.now(),
      )

      renderDots(ctx, sys, rect.width, rect.height, dpr, dotColor)

      if (needsMore) {
        animFrameRef.current = requestAnimationFrame(tick)
      } else {
        runningRef.current = false
      }
    }

    animFrameRef.current = requestAnimationFrame(tick)
  }, [dotColor])

  const rebuildParticles = useCallback(
    async (imageSrc: string) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const img = await loadImage(imageSrc)
      const processed = processImage(img, GRID_SIZE, 0, 1.03, 3.75)
      const positions = floydSteinberg(
        processed.grayscale,
        processed.width,
        processed.height,
        181,
        processed.alpha,
      )

      const sx = rect.width / processed.width
      const sy = rect.height / processed.height
      const s = Math.max(sx, sy)
      const ox = Math.round((rect.width - processed.width * s) / 2)
      const oy = Math.round((rect.height - processed.height * s) / 2)

      systemRef.current = createDotSystem(positions, s, 1, ox, oy)
      startLoop()
    },
    [startLoop],
  )

  useEffect(() => {
    rebuildParticles(src)
  }, [src, rebuildParticles])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const dpr = window.devicePixelRatio || 1

    let resizeTimer: ReturnType<typeof setTimeout> | null = null

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const sys = systemRef.current
      if (sys) renderDots(ctx, sys, rect.width, rect.height, dpr, dotColor)

      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => rebuildParticles(src), 200)
    }

    handleResize()
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas)

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      mouseRef.current.active = true
      startLoop()
    }

    const handlePointerLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      mouseRef.current.active = false
      startLoop()
    }

    const handlePointerUp = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      shockwavesRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        start: performance.now(),
      })
      if (e.pointerType !== "mouse") mouseRef.current.active = false
      startLoop()
    }

    canvas.addEventListener("pointermove", handlePointerMove)
    canvas.addEventListener("pointerleave", handlePointerLeave)
    canvas.addEventListener("pointerup", handlePointerUp)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      runningRef.current = false
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeObserver.disconnect()
      canvas.removeEventListener("pointermove", handlePointerMove)
      canvas.removeEventListener("pointerleave", handlePointerLeave)
      canvas.removeEventListener("pointerup", handlePointerUp)
    }
  }, [dotColor, startLoop, rebuildParticles, src])

  return (
    <canvas
      ref={canvasRef}
      className={`block touch-none ${className}`}
      style={{ cursor: "default", background: bgColor }}
    />
  )
}
