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

function getSetupAccentRGB(): string {
  const el = document.querySelector('[data-setup-color]')
  if (el) {
    const color = el.getAttribute('data-setup-color')
    const map: Record<string, string> = {
      'lime':   '207,250,124',
      'blue':   '96,165,250',
      'purple': '192,132,252',
      'pink':   '244,114,182',
      'orange': '251,146,60',
      'red':    '248,113,113',
      'cyan':   '34,211,238',
      'yellow': '253,224,71',
      'mint':   '45,212,191',
      'indigo': '129,140,248',
    }
    return map[color || 'lime'] || '207,250,124'
  }
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
  const map: Record<string, string> = {
    '#CFFA7C': '207,250,124',
    '#60a5fa': '96,165,250',
    '#c084fc': '192,132,252',
    '#f472b6': '244,114,182',
    '#fb923c': '251,146,60',
    '#f87171': '248,113,113',
    '#22d3ee': '34,211,238',
    '#fde047': '253,224,71',
    '#2dd4bf': '45,212,191',
    '#818cf8': '129,140,248',
  }
  return map[accent] || '207,250,124'
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
      ctx.lineWidth = 1.8
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
      const accentRGB = getSetupAccentRGB()
      const defaultColor = theme === 'dark' ? '255,255,255' : '0,0,0'
      const color = accentRGB || defaultColor
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
