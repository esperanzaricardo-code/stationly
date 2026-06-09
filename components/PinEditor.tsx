'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Pin, ShopLink } from '@/lib/supabase'

const SHOPS = ['Amazon', 'PcComponentes', 'Otro'] as const

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
  const [scanningPin, setScanningPin] = useState<number | null>(null)
  const [searchingPin, setSearchingPin] = useState<number | null>(null)
  const [scanError, setScanError] = useState('')
  const [suggestions, setSuggestions] = useState<Record<number, string>>({})
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null)
  const [hoveredPin, setHoveredPin] = useState<number | null>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

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
  }

  function updatePinName(id: number, name: string) {
    if (!onChange) return
    onChange(pins.map(p => p.id === id ? { ...p, name } : p))
  }

  function removePin(id: number) {
    if (!onChange) return
    onChange(pins.filter(p => p.id !== id))
    if (activePin === id) setActivePin(null)
  }

  function addPinLink(id: number) {
    if (!onChange) return
    onChange(pins.map(p => p.id === id ? { ...p, links: [...p.links, { shop: 'Amazon', url: '' }] } : p))
  }

  function updatePinLink(id: number, li: number, field: keyof ShopLink, value: string) {
    if (!onChange) return
    onChange(pins.map(p => p.id === id ? {
      ...p, links: p.links.map((l, k) => k === li ? { ...l, [field]: value } : l)
    } : p))
  }

  function removePinLink(id: number, li: number) {
    if (!onChange) return
    onChange(pins.map(p => p.id === id ? { ...p, links: p.links.filter((_, k) => k !== li) } : p))
  }

  async function searchProduct(pinId: number, query: string) {
    if (!query.trim()) return
    setSearchingPin(pinId)
    setScanError('')
    try {
      const res = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, singleComponent: true, textOnly: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const productName = data.components?.[0] || query
      setSuggestions(prev => ({ ...prev, [pinId]: productName }))
    } catch (err: unknown) {
      setScanError(err instanceof Error ? err.message : 'Error al buscar')
    } finally {
      setSearchingPin(null)
    }
  }

  function acceptSuggestion(pinId: number) {
    const suggestion = suggestions[pinId]
    if (!suggestion || !onChange) return
    const links = generateLinks(suggestion)
    onChange(pins.map(p => p.id === pinId ? { ...p, name: suggestion, links } : p))
    setSuggestions(prev => { const n = { ...prev }; delete n[pinId]; return n })
  }

  function rejectSuggestion(pinId: number) {
    setSuggestions(prev => { const n = { ...prev }; delete n[pinId]; return n })
  }

  async function scanComponent(pinId: number, file: File) {
    setScanningPin(pinId)
    setScanError('')
    try {
      const reader = new FileReader()
      reader.onload = async e => {
        const dataUrl = e.target?.result as string
        const base64 = dataUrl.split(',')[1]
        const mediaType = dataUrl.split(';')[0].split(':')[1]
        const res = await fetch('/api/ai-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType, singleComponent: true }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        const productName = data.components?.[0] || ''
        if (productName && onChange) {
          onChange(pins.map(p => p.id === pinId ? { ...p, name: productName, links: generateLinks(productName) } : p))
        }
        setScanningPin(null)
      }
      reader.readAsDataURL(file)
    } catch (err: unknown) {
      setScanError(err instanceof Error ? err.message : 'Error al identificar')
      setScanningPin(null)
    }
  }

  const inputStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 12,
    padding: '6px 10px', borderRadius: 'var(--radius-sm)', outline: 'none', width: '100%',
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
                Toca la imagen para añadir un componente
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {components.map((comp, i) => (
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
            <button onClick={() => setPendingPin(null)}
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
              transition: 'transform 0.15s',
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
          </div>
        ))}
      </div>

      {/* Panel de edición de pins */}
      {editing && pins.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>
            {pins.length} pin{pins.length !== 1 ? 's' : ''} añadido{pins.length !== 1 ? 's' : ''}
          </div>

          {pins.map((pin, i) => (
            <div key={pin.id}
              style={{
                background: activePin === pin.id ? 'var(--surface2)' : 'var(--surface)',
                border: `1px solid ${activePin === pin.id ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', padding: 14, cursor: 'pointer',
              }}
              onClick={() => setActivePin(activePin === pin.id ? null : pin.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: activePin === pin.id ? 12 : 0 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0a0a0b' }} />
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: pin.name ? 'var(--text)' : 'var(--text-dim)' }}>
                  {pin.name || 'Sin nombre — haz clic para editar'}
                </div>
                <button onClick={e => { e.stopPropagation(); removePin(pin.id) }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>
                  ✕
                </button>
              </div>

              {activePin === pin.id && (
                <div onClick={e => e.stopPropagation()}>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input
                        value={pin.name}
                        onChange={e => updatePinName(pin.id, e.target.value)}
                        placeholder="Ej: RTX 4090, Keychron Q1..."
                        style={{ ...inputStyle, flex: 1 }}
                        onKeyDown={e => e.key === 'Enter' && searchProduct(pin.id, pin.name)}
                      />
                      <button
                        onClick={() => searchProduct(pin.id, pin.name)}
                        disabled={searchingPin === pin.id || !pin.name.trim()}
                        style={{
                          background: 'var(--tag-bg)', border: '1px solid var(--tag-border)',
                          color: 'var(--tag-text)', borderRadius: 'var(--radius-sm)',
                          padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                          flexShrink: 0, opacity: searchingPin === pin.id || !pin.name.trim() ? 0.5 : 1,
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {searchingPin === pin.id ? '⏳' : '🔍 Buscar'}
                      </button>
                    </div>

                    {suggestions[pin.id] && (
                      <div style={{ background: 'var(--tag-bg)', border: '1px solid var(--tag-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>✦ Sugerencia IA:</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tag-text)', marginBottom: 8 }}>{suggestions[pin.id]}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => acceptSuggestion(pin.id)} style={{ flex: 1, background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)', border: 'none', color: '#0a0a0b', fontSize: 12, fontWeight: 700, padding: '6px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                            ✓ Aceptar + links automáticos
                          </button>
                          <button onClick={() => rejectSuggestion(pin.id)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                      onChange={e => e.target.files?.[0] && scanComponent(pin.id, e.target.files[0])} />
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => e.target.files?.[0] && scanComponent(pin.id, e.target.files[0])} />
                    <button onClick={() => cameraRef.current?.click()} disabled={scanningPin === pin.id}
                      style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '7px', cursor: 'pointer', fontSize: 12, opacity: scanningPin === pin.id ? 0.5 : 1 }}>
                      {scanningPin === pin.id ? '⏳ Identificando...' : '📷 Foto con IA'}
                    </button>
                    <button onClick={() => fileRef.current?.click()} disabled={scanningPin === pin.id}
                      style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '7px', cursor: 'pointer', fontSize: 12, opacity: scanningPin === pin.id ? 0.5 : 1 }}>
                      {scanningPin === pin.id ? '⏳' : '🖼️ Subir imagen'}
                    </button>
                  </div>

                  {scanError && <div style={{ color: '#ff4d6d', fontSize: 11, marginBottom: 8 }}>⚠️ {scanError}</div>}

                  {pin.links.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Links de compra</div>
                      {pin.links.map((link, li) => (
                        <div key={li} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                          <select value={link.shop} onChange={e => updatePinLink(pin.id, li, 'shop', e.target.value)} style={{ ...inputStyle, width: 'auto', flexShrink: 0 }}>
                            {SHOPS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <input value={link.url} onChange={e => updatePinLink(pin.id, li, 'url', e.target.value)} placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
                          <button onClick={() => removePinLink(pin.id, li)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={() => addPinLink(pin.id)}
                    style={{ background: 'transparent', border: '1px dashed var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', cursor: 'pointer', fontSize: 12, width: '100%', marginTop: 4 }}>
                    + Añadir link manual
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
