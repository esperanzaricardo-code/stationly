'use client'
import { useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'

type Shape = {
  x: number; y: number
  size: number
  type: 'triangle' | 'square' | 'diamond'
  rotation: number
  speedX: number; speedY: number; speedR: number
  opacity: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let shapes: Shape[] = []

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function randomShape(): Shape {
      const types: Shape['type'][] = ['triangle', 'square', 'diamond']
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 18 + Math.random() * 36,
        type: types[Math.floor(Math.random() * types.length)],
        rotation: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        speedR: (Math.random() - 0.5) * 0.003,
        opacity: 0.04 + Math.random() * 0.07,
      }
    }

    function drawTriangle(ctx: CanvasRenderingContext2D, s: Shape) {
      const h = s.size * 0.866
      ctx.beginPath()
      ctx.moveTo(0, -h * 0.667)
      ctx.lineTo(s.size / 2, h * 0.333)
      ctx.lineTo(-s.size / 2, h * 0.333)
      ctx.closePath()
      ctx.stroke()
    }

    function drawSquare(ctx: CanvasRenderingContext2D, s: Shape) {
      ctx.beginPath()
      ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size)
      ctx.stroke()
    }

    function drawDiamond(ctx: CanvasRenderingContext2D, s: Shape) {
      ctx.beginPath()
      ctx.moveTo(0, -s.size / 2)
      ctx.lineTo(s.size / 2, 0)
      ctx.lineTo(0, s.size / 2)
      ctx.lineTo(-s.size / 2, 0)
      ctx.closePath()
      ctx.stroke()
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const color = theme === 'dark' ? '255,255,255' : '0,0,0'

      shapes.forEach(s => {
        s.x += s.speedX
        s.y += s.speedY
        s.rotation += s.speedR

        // Wrap around edges
        if (s.x < -s.size) s.x = canvas.width + s.size
        if (s.x > canvas.width + s.size) s.x = -s.size
        if (s.y < -s.size) s.y = canvas.height + s.size
        if (s.y > canvas.height + s.size) s.y = -s.size

        ctx.save()
        ctx.translate(s.x, s.y)
        ctx.rotate(s.rotation)
        ctx.strokeStyle = `rgba(${color},${s.opacity})`
        ctx.lineWidth = 0.8
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        if (s.type === 'triangle') drawTriangle(ctx, s)
        else if (s.type === 'square') drawSquare(ctx, s)
        else drawDiamond(ctx, s)

        ctx.restore()
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    shapes = Array.from({ length: 28 }, randomShape)
    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none', width: '100%', height: '100%',
      }}
    />
  )
}
