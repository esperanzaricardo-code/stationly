'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Pin, ShopLink } from '@/lib/supabase'

function generateLinks(productName: string): ShopLink[] {
  const query = productName.trim().replace(/\s+/g, '+')
  return [
    { shop: 'Amazon', url: `https://www.amazon.es/s?k=${query}` },
    { shop: 'PcComponentes', url: `https://www.pccomponentes.com/buscar/?query=${query}` },
  ]
}

type Props = {
  imageUrl: string
  pins: Pin[]
  isOwner: boolean
  editing: boolean
  components?: { name: string }[]
  onChange?: (pins: Pin[]) => void
}

export default function PinEditor({ imageUrl, pins, isOwner, editing, components = [], onChange }: Props) {
  const [activePin, setActivePin] = useState<number | null>(null)
  const [hoveredPin, setHoveredPin] = useState<number | null>(null)
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null)
  const [pendingSearch, setPendingSearch] = useState('')
  const imageRef = useRef<HTMLDivElement>(null)

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!editing || !onChange) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    if (components.length > 0) {
      setPendingPin({ x, y })
    } else {
      const newPin: Pin = { id: Date.now(), x, y, name: '', links: [] }
      onChange([...pins, newPin])
      setActivePin(newPin.id)
    }
  }

  function selectComponentForPin(componentName: string) {
    if (!pendingPin || !onChange) return
    const links = generateLinks(componentName)
    const newPin: Pin = { id: Date.now(), x: pendingPin.x, y: pendingPin.y, name: componentName, links }
    onChange([...pins, newPin])
    setActivePin(newPin.id)
    setPendingPin(null)
    setPendingSearch('')
  }

  function removePin(id: number) {
    if (!onChange) return
    onChange(pins.filter(p => p.id !== id))
    if (activePin === id) setActivePin(null)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={imageRef}
        onClick={handleImageClick}
        style={{
          position: 'relative', width: '100%', aspectRatio: '4/3',
          borderRadius: 'var(--radius)',
          border: `1px solid ${editing ? 'var(--accent)' : 'var(--border)'}`,
          cursor: editing ? 'crosshair' : 'default',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'visible',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <Image src={imageUrl} alt="Setup" fill style={{ objectFit: 'cover' }} sizes="(max-width: 900px) 100vw, 900px" priority />
        </div>

        {editing && pins.length === 0 && !pendingPin && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', borderRadius: 'var(--radius)',
            pointerEvents: 'none',
          }}>
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📍</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>
                Toca la imagen para marcar un componente
              </div>
            </div>
          </div>
        )}

        {/* Modal selector de componente */}
        {pendingPin && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: `${Math.min(pendingPin.x, 65)}%`,
              top: `${Math.min(pendingPin.y, 65)}%`,
              background: 'var(--surface)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              padding: 12,
              minWidth: 220,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 40,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
              ¿Qué componente es este?
            </div>
            <input
              autoFocus
              placeholder="Buscar componente..."
              value={pendingSearch}
              onChange={e => setPendingSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 12,
                padding: '6px 10px', borderRadius: 'var(--radius-sm)', outline: 'none',
                width: '100%', marginBottom: 8, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {components
                .filter(c => c.name.toLowerCase().includes(pendingSearch.toLowerCase()))
                .map((comp, i) => (
                  <button key={i} onClick={() => selectComponentForPin(comp.name)}
                    style={{
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      color: 'var(--text)', borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      textAlign: 'left', transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    {comp.name}
                  </button>
                ))}
            </div>
            <button onClick={() => { setPendingPin(null); setPendingSearch('') }}
              style={{ marginTop: 8, background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', width: '100%', textAlign: 'center' }}>
              Cancelar
            </button>
          </div>
        )}

        {/* Pins */}
        {pins.map((pin) => (
          <div
            key={pin.id}
            onClick={e => { e.stopPropagation(); setActivePin(activePin === pin.id ? null : pin.id) }}
            onMouseEnter={() => setHoveredPin(pin.id)}
            onMouseLeave={() => setHoveredPin(null)}
            style={{
              position: 'absolute',
              left: `${pin.x}%`, top: `${pin.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 20, cursor: 'pointer',
            }}
          >
            <div style={{
              width: hoveredPin === pin.id || activePin === pin.id ? 26 : 18,
              height: hoveredPin === pin.id || activePin === pin.id ? 26 : 18,
              borderRadius: '50%',
              background: activePin === pin.id ? 'var(--accent)' : 'rgba(0,0,0,0.75)',
              border: `2px solid ${activePin === pin.id ? '#0a0a0b' : 'var(--accent)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'all 0.15s',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                width: hoveredPin === pin.id || activePin === pin.id ? 7 : 5,
                height: hoveredPin === pin.id || activePin === pin.id ? 7 : 5,
                borderRadius: '50%',
                background: activePin === pin.id ? '#0a0a0b' : 'var(--accent)',
                transition: 'all 0.15s',
              }} />
            </div>

            {/* Tooltip vista pública */}
            {!editing && activePin === pin.id && pin.name && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  bottom: 36,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  minWidth: 200,
                  maxWidth: 260,
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 30,
                  pointerEvents: 'auto',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  {pin.name}
                </div>
                {pin.links.length > 0 ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {pin.links.filter(l => l.shop !== 'MediaMarkt').map((link, li) => (
                      <a key={li} href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)', color: '#0a0a0b', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 50, textDecoration: 'none' }}>
                        {link.shop} →
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Sin links de compra</div>
                )}
              </div>
            )}

            {/* Botón eliminar en modo edición */}
            {editing && activePin === pin.id && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  bottom: 30,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 30,
                  display: 'flex', alignItems: 'center', gap: 8,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{pin.name}</span>
                <button onClick={() => removePin(pin.id)}
                  style={{ background: 'rgba(255,77,109,0.15)', border: '1px solid rgba(255,77,109,0.3)', color: '#ff4d6d', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}>
                  Quitar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
