'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Pin, ShopLink } from '@/lib/supabase'

const SHOPS = ['Amazon', 'PcComponentes', 'MediaMarkt', 'Otro'] as const

function generateLinks(productName: string): ShopLink[] {
  const query = encodeURIComponent(productName)
  return [
    { shop: 'Amazon', url: `https://www.amazon.es/s?k=${query}` },
    { shop: 'PcComponentes', url: `https://www.pccomponentes.com/buscar/?query=${query}` },
    { shop: 'MediaMarkt', url: `https://www.mediamarkt.es/es/search.html?query=${query}` },
  ]
}

type Props = {
  imageUrl: string
  pins: Pin[]
  isOwner: boolean
  editing: boolean
  onChange?: (pins: Pin[]) => void
}

export default function PinEditor({ imageUrl, pins, isOwner, editing, onChange }: Props) {
  const [activePin, setActivePin] = useState<number | null>(null)
  const [scanningPin, setScanningPin] = useState<number | null>(null)
  const [searchingPin, setSearchingPin] = useState<number | null>(null)
  const [scanError, setScanError] = useState('')
  const [suggestions, setSuggestions] = useState<Record<number, string>>({})
  const imageRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!editing || !onChange) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const newPin: Pin = {
      id: Date.now(),
      x, y,
      name: '',
      links: [],
    }
    const updated = [...pins, newPin]
    onChange(updated)
    setActivePin(newPin.id)
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
        if (productName) {
          const links = generateLinks(productName)
          if (onChange) {
            onChange(pins.map(p => p.id === pinId ? { ...p, name: productName, links } : p))
          }
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
      {/* Imagen con pins */}
      <div
        ref={imageRef}
        onClick={handleImageClick}
        style={{
          position: 'relative', width: '100%', aspectRatio: '4/3',
          borderRadius: 'var(--radius)', overflow: 'hidden',
          border: `1px solid ${editing ? 'var(--accent)' : 'var(--border)'}`,
          cursor: editing ? 'crosshair' : 'default',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Image src={imageUrl} alt="Setup" fill style={{ objectFit: 'cover' }} sizes="(max-width: 900px) 100vw, 900px" priority />

        {editing && pins.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
          }}>
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📍</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>
                Toca la imagen para añadir un componente
              </div>
            </div>
          </div>
        )}

        {/* Pins */}
        {pins.map((pin, i) => (
          <div
            key={pin.id}
            onClick={e => { e.stopPropagation(); setActivePin(activePin === pin.id ? null : pin.id) }}
            style={{
              position: 'absolute',
              left: `${pin.x}%`, top: `${pin.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10, cursor: 'pointer',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: activePin === pin.id ? 'var(--accent)' : 'rgba(0,0,0,0.8)',
              border: `2px solid ${activePin === pin.id ? '#0a0a0b' : 'var(--accent)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11,
              color: activePin === pin.id ? '#0a0a0b' : 'var(--accent)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'all 0.2s',
              backdropFilter: 'blur(4px)',
            }}>
              {i + 1}
            </div>

            {/* Tooltip vista pública */}
            {!editing && activePin === pin.id && pin.name && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', bottom: 36, left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '12px 14px',
                  minWidth: 180, maxWidth: 240,
                  boxShadow: 'var(--shadow-lg)', zIndex: 20,
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  {pin.name}
                </div>
                {pin.links.length > 0 ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {pin.links.map((link, li) => (
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

      {/* Panel de edición */}
      {editing && pins.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>
            📍 Componentes marcados — {pins.length} pin{pins.length !== 1 ? 's' : ''}
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
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11, color: '#0a0a0b',
                }}>
                  {i + 1}
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

                  {/* Buscador */}
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

                    {/* Sugerencia de la IA */}
                    {suggestions[pin.id] && (
                      <div style={{
                        background: 'var(--tag-bg)', border: '1px solid var(--tag-border)',
                        borderRadius: 'var(--radius-sm)', padding: '10px 12px',
                        marginBottom: 8,
                      }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>✦ Sugerencia IA:</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tag-text)', marginBottom: 8 }}>
                          {suggestions[pin.id]}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => acceptSuggestion(pin.id)} style={{
                            flex: 1, background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
                            border: 'none', color: '#0a0a0b', fontSize: 12, fontWeight: 700,
                            padding: '6px', borderRadius: 6, cursor: 'pointer',
                            fontFamily: 'var(--font-display)',
                          }}>
                            ✓ Aceptar + links automáticos
                          </button>
                          <button onClick={() => rejectSuggestion(pin.id)} style={{
                            background: 'var(--surface2)', border: '1px solid var(--border)',
                            color: 'var(--text-muted)', fontSize: 12, padding: '6px 10px',
                            borderRadius: 6, cursor: 'pointer',
                          }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Foto con IA */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment"
                      style={{ display: 'none' }}
                      onChange={e => e.target.files?.[0] && scanComponent(pin.id, e.target.files[0])} />
                    <input ref={fileRef} type="file" accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => e.target.files?.[0] && scanComponent(pin.id, e.target.files[0])} />
                    <button onClick={() => cameraRef.current?.click()} disabled={scanningPin === pin.id}
                      style={{
                        flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
                        color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)',
                        padding: '7px', cursor: 'pointer', fontSize: 12,
                        opacity: scanningPin === pin.id ? 0.5 : 1,
                      }}>
                      {scanningPin === pin.id ? '⏳ Identificando...' : '📷 Foto con IA'}
                    </button>
                    <button onClick={() => fileRef.current?.click()} disabled={scanningPin === pin.id}
                      style={{
                        flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
                        color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)',
                        padding: '7px', cursor: 'pointer', fontSize: 12,
                        opacity: scanningPin === pin.id ? 0.5 : 1,
                      }}>
                      {scanningPin === pin.id ? '⏳' : '🖼️ Subir imagen'}
                    </button>
                  </div>

                  {scanError && <div style={{ color: '#ff4d6d', fontSize: 11, marginBottom: 8 }}>⚠️ {scanError}</div>}

                  {/* Links manuales */}
                  {pin.links.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Links de compra</div>
                      {pin.links.map((link, li) => (
                        <div key={li} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                          <select value={link.shop} onChange={e => updatePinLink(pin.id, li, 'shop', e.target.value)}
                            style={{ ...inputStyle, width: 'auto', flexShrink: 0 }}>
                            {SHOPS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <input value={link.url} onChange={e => updatePinLink(pin.id, li, 'url', e.target.value)}
                            placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
                          <button onClick={() => removePinLink(pin.id, li)}
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', flexShrink: 0 }}>
                            ✕
                          </button>
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
