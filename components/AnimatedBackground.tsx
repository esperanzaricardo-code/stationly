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
        size: 20 + Math.random() * 40,
        type: types[Math.floor(Math.random() * types.length)],
        rotation: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        speedR: (Math.random() - 0.5) * 0.004,
        opacity: 0.06 + Math.random() * 0.09,
      }
    }

    function drawShape(ctx: CanvasRenderingContext2D, s: Shape) {
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(s.rotation)
      ctx.lineWidth = 0.8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()

      if (s.type === 'triangle') {
        const h = s.size * 0.866
        ctx.moveTo(0, -h * 0.667)
        ctx.lineTo(s.size / 2, h * 0.333)
        ctx.lineTo(-s.size / 2, h * 0.333)
        ctx.closePath()
      } else if (s.type === 'square') {
        ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size)
      } else {
        ctx.moveTo(0, -s.size / 2)
        ctx.lineTo(s.size / 2, 0)
        ctx.lineTo(0, s.size / 2)
        ctx.lineTo(-s.size / 2, 0)
        ctx.closePath()
      }

      ctx.stroke()
      ctx.restore()
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const color = theme === 'dark' ? '255,255,255' : '0,0,0'

      shapes.forEach(s => {
        s.x += s.speedX
        s.y += s.speedY
        s.rotation += s.speedR

        if (s.x < -s.size * 2) s.x = canvas.width + s.size
        if (s.x > canvas.width + s.size * 2) s.x = -s.size
        if (s.y < -s.size * 2) s.y = canvas.height + s.size
        if (s.y > canvas.height + s.size * 2) s.y = -s.size

        ctx.strokeStyle = `rgba(${color},${s.opacity})`
        drawShape(ctx, s)
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    shapes = Array.from({ length: 30 }, randomShape)
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
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
