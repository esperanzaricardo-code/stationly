'use client'
import { useRef, useState, useEffect, useCallback } from 'react'

const ASPECT = 4 / 3

type Props = {
  src: string
  onCrop: (croppedDataUrl: string) => void
  onCancel: () => void
}

export default function ImageCropper({ src, onCrop, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  const PREVIEW_W = 480
  const PREVIEW_H = Math.round(PREVIEW_W / ASPECT)

  // Minimum scale: image fits entirely inside the frame (letterbox)
  const fitScale = useRef(1)

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      imgRef.current = img
      const naturalW = img.naturalWidth
      const naturalH = img.naturalHeight
      // Fit inside (not cover) — image fully visible
      const scaleToFit = Math.min(PREVIEW_W / naturalW, PREVIEW_H / naturalH)
      fitScale.current = scaleToFit
      const displayW = naturalW * scaleToFit
      const displayH = naturalH * scaleToFit
      setImgSize({ w: displayW, h: displayH })
      setScale(scaleToFit)
      // Center the image
      setOffset({ x: (PREVIEW_W - displayW) / 2, y: (PREVIEW_H - displayH) / 2 })
    }
    img.src = src
  }, [src])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Background fill
    ctx.fillStyle = '#0a0a0b'
    ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H)
    ctx.drawImage(imgRef.current, offset.x, offset.y, imgSize.w, imgSize.h)
  }, [offset, imgSize])

  useEffect(() => { draw() }, [draw])

  function onMouseDown(e: React.MouseEvent) {
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return
    const dx = e.clientX - dragStart.current.mx
    const dy = e.clientY - dragStart.current.my
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy })
  }

  function onMouseUp() { setDragging(false) }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y }
  }

  function onTouchMove(e: React.TouchEvent) {
    const t = e.touches[0]
    const dx = t.clientX - dragStart.current.mx
    const dy = t.clientY - dragStart.current.my
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy })
  }

  function handleZoom(e: React.ChangeEvent<HTMLInputElement>) {
    const newScale = parseFloat(e.target.value)
    if (!imgRef.current) return
    const newW = imgRef.current.naturalWidth * newScale
    const newH = imgRef.current.naturalHeight * newScale
    // Keep centered when zooming
    setOffset(prev => ({
      x: prev.x - (newW - imgSize.w) / 2,
      y: prev.y - (newH - imgSize.h) / 2,
    }))
    setScale(newScale)
    setImgSize({ w: newW, h: newH })
  }

  function handleCrop() {
    const canvas = canvasRef.current
    if (!canvas) return
    const out = document.createElement('canvas')
    out.width = 800
    out.height = 600
    const ctx = out.getContext('2d')
    if (!ctx || !imgRef.current) return
    const scaleX = 800 / PREVIEW_W
    const scaleY = 600 / PREVIEW_H
    ctx.fillStyle = '#0a0a0b'
    ctx.fillRect(0, 0, 800, 600)
    ctx.drawImage(imgRef.current, offset.x * scaleX, offset.y * scaleY, imgSize.w * scaleX, imgSize.h * scaleY)
    onCrop(out.toDataURL('image/jpeg', 0.92))
  }

  const minScale = fitScale.current * 0.4 // allow zooming out to 40% of fit
  const maxScale = fitScale.current * 3

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>✦</span> Ajusta el encuadre — arrastra para mover, zoom para ajustar el tamaño
      </div>

      {/* Canvas */}
      <div
        style={{
          width: '100%', aspectRatio: '4/3',
          borderRadius: 'var(--radius-sm)', overflow: 'hidden',
          cursor: dragging ? 'grabbing' : 'grab',
          border: '2px solid var(--accent)',
          position: 'relative', userSelect: 'none',
          background: '#0a0a0b',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => {}}
      >
        <canvas
          ref={canvasRef}
          width={PREVIEW_W}
          height={PREVIEW_H}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(207,250,124,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(207,250,124,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '33.33% 33.33%',
        }} />
      </div>

      {/* Zoom slider */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>🔍− Zoom +</span>
        <input
          type="range"
          min={minScale}
          max={maxScale}
          step={0.001}
          value={scale}
          onChange={handleZoom}
          style={{ flex: 1, accentColor: 'var(--accent)' }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={handleCrop} className="btn-primary" style={{ flex: 1, fontSize: 13, padding: '10px' }}>
          ✓ Aplicar encuadre
        </button>
        <button onClick={onCancel} className="btn-secondary" style={{ fontSize: 13, padding: '10px 16px' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
