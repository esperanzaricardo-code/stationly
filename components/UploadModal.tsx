'use client'
import { useEffect, useRef, useState } from 'react'

type AiTag = { label: string; accepted: boolean }

export default function UploadModal() {
  const [open, setOpen] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dragover, setDragover] = useState(false)
  const [userName, setUserName] = useState('')
  const [title, setTitle] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [aiTags, setAiTags] = useState<AiTag[]>([])
  const [aiScanning, setAiScanning] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiDone, setAiDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const open = () => setOpen(true)
    document.addEventListener('stationly:open-upload', open)
    return () => document.removeEventListener('stationly:open-upload', open)
  }, [])

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) { alert('Máximo 10MB'); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setAiTags([]); setAiDone(false); setAiError('')
  }

  function clearImage() {
    setImageFile(null); setImagePreview(null)
    setAiTags([]); setAiDone(false); setAiError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function closeModal() {
    setOpen(false)
    clearImage()
    setUserName(''); setTitle(''); setTagsInput('')
    setSubmitting(false)
  }

  async function runAiScan() {
    if (!imagePreview) return
    setAiScanning(true); setAiError(''); setAiTags([]); setAiDone(false)
    try {
      const base64 = imagePreview.split(',')[1]
      const mediaType = imagePreview.split(';')[0].split(':')[1]
      const res = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error desconocido')
      setAiTags(data.components.map((l: string) => ({ label: l, accepted: true })))
      setAiDone(true)
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Error al analizar la imagen')
    } finally {
      setAiScanning(false)
    }
  }

  function applyAiTags() {
    const accepted = aiTags.filter(t => t.accepted).map(t => t.label)
    if (!accepted.length) return
    const existing = tagsInput.trim()
    const merged = existing
      ? [...new Set([...existing.split(',').map(s => s.trim()), ...accepted])].join(', ')
      : accepted.join(', ')
    setTagsInput(merged)
  }

  function autoCategory(tags: string[]) {
    const all = tags.join(' ').toLowerCase()
    if (/rtx|rx |gpu|nvidia|amd|radeon/.test(all)) return 'gaming'
    if (/elgato|stream deck|shure|rode|capture/.test(all)) return 'streaming'
    if (/mac|apple/.test(all)) return 'minimal'
    if (/rgb|nzxt|corsair|lian/.test(all)) return 'rgb'
    return 'workstation'
  }

  async function submitSetup() {
    if (!userName.trim()) { document.getElementById('inp-name')?.focus(); return }
    if (!title.trim()) { document.getElementById('inp-title')?.focus(); return }
    setSubmitting(true)
    try {
      const tags = tagsInput.trim()
        ? tagsInput.split(',').map(t => t.trim()).filter(Boolean).slice(0, 10)
        : ['Custom Setup']
      const category = autoCategory(tags)
      const fd = new FormData()
      fd.append('user_name', userName.trim())
      fd.append('title', title.trim())
      fd.append('category', category)
      fd.append('tags', JSON.stringify(tags))
      if (imageFile) fd.append('image', imageFile)
      const res = await fetch('/api/setups', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      document.dispatchEvent(new CustomEvent('stationly:new-setup', { detail: data }))
      closeModal()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) closeModal() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, width: '100%', maxWidth: 560, padding: 32,
        position: 'relative', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
      }}>
        <button onClick={closeModal} style={{
          position: 'absolute', top: 20, right: 20, background: 'var(--surface2)',
          border: '1px solid var(--border)', color: 'var(--text-muted)',
          width: 32, height: 32, borderRadius: '50%', fontSize: 16,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
          Sube tu Setup
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          Muéstrale al mundo cómo trabajas y juegas.
        </p>

        {/* Drop Zone */}
        {!imagePreview && (
          <div
            onDragOver={e => { e.preventDefault(); setDragover(true) }}
            onDragLeave={() => setDragover(false)}
            onDrop={e => { e.preventDefault(); setDragover(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragover ? 'var(--accent)' : 'rgba(124,92,252,0.4)'}`,
              borderRadius: 'var(--radius)', background: dragover ? 'rgba(124,92,252,0.08)' : 'rgba(124,92,252,0.04)',
              padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
              marginBottom: 20, transition: 'all 0.2s',
            }}
          >
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              Arrastra tu foto aquí o haz clic
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>PNG, JPG, WEBP · Máx 10MB</div>
          </div>
        )}

        {/* Preview */}
        {imagePreview && (
          <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 20 }}>
            <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
            <button onClick={clearImage} style={{
              position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)',
              color: '#fff', border: 'none', width: 28, height: 28, borderRadius: '50%',
              fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        )}

        {/* AI Panel */}
        {imagePreview && (
          <div style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>
                ✦ Detección de componentes
                <span style={{
                  background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
                  color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 1,
                  textTransform: 'uppercase', padding: '2px 8px', borderRadius: 50,
                }}>IA</span>
              </div>
              <button
                onClick={runAiScan}
                disabled={aiScanning}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
                  color: '#fff', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                  padding: '7px 14px', borderRadius: 50, border: 'none',
                  cursor: aiScanning ? 'not-allowed' : 'pointer', opacity: aiScanning ? 0.5 : 1,
                  boxShadow: '0 2px 12px var(--accent-glow)',
                }}
              >
                {aiScanning ? '⏳ Analizando...' : aiDone ? '🔄 Re-analizar' : '🔍 Analizar foto'}
              </button>
            </div>

            {aiScanning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13, padding: '4px 0' }}>
                <span style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                      display: 'inline-block',
                      animation: `dotBounce 1.2s ease ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </span>
                <style>{`@keyframes dotBounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
                Claude está analizando tu setup...
              </div>
            )}

            {aiError && (
              <div style={{ color: '#ff4d6d', fontSize: 12, marginTop: 8 }}>⚠️ {aiError}</div>
            )}

            {aiTags.length > 0 && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {aiTags.map((t, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: t.accepted ? 'rgba(124,92,252,0.1)' : 'transparent',
                      border: `1px solid ${t.accepted ? 'rgba(124,92,252,0.3)' : 'var(--border)'}`,
                      borderRadius: 50, padding: '4px 10px 4px 6px',
                      fontSize: 12, color: t.accepted ? '#c4aaff' : 'var(--text-dim)',
                      opacity: t.accepted ? 1 : 0.35,
                      textDecoration: t.accepted ? 'none' : 'line-through',
                    }}>
                      <button
                        onClick={() => setAiTags(prev => prev.map((x, j) => j === i ? { ...x, accepted: !x.accepted } : x))}
                        style={{
                          width: 16, height: 16, borderRadius: '50%',
                          background: t.accepted ? 'var(--accent)' : 'var(--surface3)',
                          border: 'none', color: '#fff', fontSize: 9, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                      >{t.accepted ? '✓' : '✕'}</button>
                      {t.label}
                    </div>
                  ))}
                </div>
                <button
                  onClick={applyAiTags}
                  style={{
                    marginTop: 10, background: 'rgba(52,211,153,0.1)',
                    border: '1px solid rgba(52,211,153,0.35)', color: 'var(--green)',
                    fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                    padding: '7px 16px', borderRadius: 50, cursor: 'pointer', width: '100%',
                  }}
                >✓ Aplicar componentes detectados</button>
              </>
            )}
          </div>
        )}

        {/* Form */}
        {[
          { id: 'inp-name', label: 'Tu nombre / alias', value: userName, set: setUserName, placeholder: 'Ej: ShadowSetup, NightOwl...' },
          { id: 'inp-title', label: 'Nombre del Setup', value: title, set: setTitle, placeholder: 'Ej: The Cyberpunk Lair...' },
        ].map(f => (
          <div key={f.id} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
              {f.label}
            </label>
            <input
              id={f.id}
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder}
              style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14,
                padding: '11px 14px', borderRadius: 'var(--radius-sm)', outline: 'none',
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
            Componentes <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(separados por coma)</span>
          </label>
          <input
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="RTX 4090, Keychron K2, LG OLED 27..."
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14,
              padding: '11px 14px', borderRadius: 'var(--radius-sm)', outline: 'none',
            }}
          />
        </div>

        <button
          onClick={submitSetup}
          disabled={submitting}
          style={{
            width: '100%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
            color: '#fff', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
            letterSpacing: '0.3px', padding: 14, borderRadius: 50, border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
            boxShadow: '0 4px 20px var(--accent-glow)', marginTop: 8, transition: 'all 0.2s',
          }}
        >
          {submitting ? '⏳ Publicando...' : '🚀 Publicar en el Feed'}
        </button>
      </div>
    </div>
  )
}
