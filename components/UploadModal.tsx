'use client'
import { useEffect, useRef, useState } from 'react'
import ImageCropper from './ImageCropper'

type AiTag = { label: string; accepted: boolean }

export default function UploadModal() {
  const [open, setOpen] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [rawPreview, setRawPreview] = useState<string | null>(null)
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
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
    reader.onload = e => {
      setRawPreview(e.target?.result as string)
      setCroppedPreview(null)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
    setAiTags([]); setAiDone(false); setAiError('')
  }

  function handleCropDone(dataUrl: string) {
    setCroppedPreview(dataUrl)
    setShowCropper(false)
  }

  function handleCropCancel() {
    setRawPreview(null)
    setImageFile(null)
    setShowCropper(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function clearImage() {
    setImageFile(null); setRawPreview(null); setCroppedPreview(null)
    setShowCropper(false)
    setAiTags([]); setAiDone(false); setAiError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function closeModal() {
    setOpen(false); clearImage()
    setUserName(''); setTitle(''); setTagsInput(''); setSubmitting(false)
  }

  async function runAiScan() {
    const preview = croppedPreview || rawPreview
    if (!preview) return
    setAiScanning(true); setAiError(''); setAiTags([]); setAiDone(false)
    try {
      const base64 = preview.split(',')[1]
      const mediaType = preview.split(';')[0].split(':')[1]
      const res = await fetch('/api/ai-scan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error desconocido')
      setAiTags(data.components.map((l: string) => ({ label: l, accepted: true })))
      setAiDone(true)
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Error al analizar')
    } finally {
      setAiScanning(false)
    }
  }

  function applyAiTags() {
    const accepted = aiTags.filter(t => t.accepted).map(t => t.label)
    if (!accepted.length) return
    const existing = tagsInput.trim()
    const merged = existing
      ? Array.from(new Set([...existing.split(',').map(s => s.trim()), ...accepted])).join(', ')
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
    if (!userName.trim()) return
    if (!title.trim()) return
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

      // Use cropped image if available, otherwise original file
      if (croppedPreview) {
        const res = await fetch(croppedPreview)
        const blob = await res.blob()
        fd.append('image', new File([blob], 'setup.jpg', { type: 'image/jpeg' }))
      } else if (imageFile) {
        fd.append('image', imageFile)
      }

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

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14,
    padding: '11px 14px', borderRadius: 'var(--radius-sm)', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
    letterSpacing: '0.8px', textTransform: 'uppercase' as const, marginBottom: 7,
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) closeModal() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 560, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
        <button onClick={closeModal} style={{ position: 'absolute', top: 20, right: 20, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6, color: 'var(--text)' }}>Sube tu Setup</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Muéstrale al mundo cómo trabajas y juegas.</p>

        {/* Drop zone */}
        {!rawPreview && !croppedPreview && (
          <div
            onDragOver={e => { e.preventDefault(); setDragover(true) }}
            onDragLeave={() => setDragover(false)}
            onDrop={e => { e.preventDefault(); setDragover(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${dragover ? 'var(--accent)' : 'var(--border-strong)'}`, borderRadius: 'var(--radius)', background: dragover ? 'var(--tag-bg)' : 'var(--surface2)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', marginBottom: 20, transition: 'all 0.2s' }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div style={{ fontSize: 36, marginBottom: 10 }}>🖼️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Arrastra tu foto aquí o haz clic</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>PNG, JPG, WEBP · Máx 10MB</div>
          </div>
        )}

        {/* Cropper */}
        {showCropper && rawPreview && (
          <ImageCropper
            src={rawPreview}
            onCrop={handleCropDone}
            onCancel={handleCropCancel}
          />
        )}

        {/* Cropped preview */}
        {!showCropper && croppedPreview && (
          <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 16 }}>
            <img src={croppedPreview} alt="Preview" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
              <button onClick={() => setShowCropper(true)} style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, padding: '4px 10px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                ✎ Reencuadrar
              </button>
              <button onClick={clearImage} style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', width: 28, height: 28, borderRadius: '50%', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>
        )}

        {/* AI Panel — only show when image is cropped and cropper is hidden */}
        {!showCropper && croppedPreview && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                ✦ Detección IA
                <span style={{ background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)', color: '#0a0a0b', fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 50 }}>IA</span>
              </div>
              <button onClick={runAiScan} disabled={aiScanning} className="btn-primary" style={{ fontSize: 11, padding: '6px 14px', opacity: aiScanning ? 0.5 : 1 }}>
                {aiScanning ? '⏳ Analizando...' : aiDone ? '🔄 Re-analizar' : '🔍 Analizar foto'}
              </button>
            </div>
            {aiScanning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                <span style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: `dotBounce 1.2s ease ${i*0.2}s infinite` }} />)}
                </span>
                Claude está analizando tu setup...
              </div>
            )}
            {aiError && <div style={{ color: '#ff4d6d', fontSize: 12, marginTop: 6 }}>⚠️ {aiError}</div>}
            {aiTags.length > 0 && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {aiTags.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: t.accepted ? 'var(--tag-bg)' : 'transparent', border: `1px solid ${t.accepted ? 'var(--tag-border)' : 'var(--border)'}`, borderRadius: 50, padding: '4px 10px 4px 6px', fontSize: 12, color: t.accepted ? 'var(--tag-text)' : 'var(--text-dim)', opacity: t.accepted ? 1 : 0.4, textDecoration: t.accepted ? 'none' : 'line-through' }}>
                      <button onClick={() => setAiTags(prev => prev.map((x, j) => j === i ? { ...x, accepted: !x.accepted } : x))}
                        style={{ width: 16, height: 16, borderRadius: '50%', background: t.accepted ? 'var(--accent)' : 'var(--surface3)', border: 'none', color: t.accepted ? '#0a0a0b' : 'var(--text-dim)', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {t.accepted ? '✓' : '✕'}
                      </button>
                      {t.label}
                    </div>
                  ))}
                </div>
                <button onClick={applyAiTags} style={{ marginTop: 10, background: 'var(--tag-bg)', border: '1px solid var(--tag-border)', color: 'var(--tag-text)', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, padding: '7px 16px', borderRadius: 50, cursor: 'pointer', width: '100%' }}>
                  ✓ Aplicar componentes detectados
                </button>
              </>
            )}
          </div>
        )}

        {/* Form fields — only show when not in cropper */}
        {!showCropper && (
          <>
            {[
              { label: 'Tu nombre / alias', value: userName, set: setUserName, placeholder: 'Ej: ShadowSetup, NightOwl...' },
              { label: 'Nombre del Setup', value: title, set: setTitle, placeholder: 'Ej: The Cyberpunk Lair...' },
              { label: 'Componentes (separados por coma)', value: tagsInput, set: setTagsInput, placeholder: 'RTX 4090, Keychron K2, LG OLED...' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={labelStyle}>{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={inputStyle} />
              </div>
            ))}

            <button onClick={submitSetup} disabled={submitting} className="btn-primary" style={{ width: '100%', fontSize: 15, padding: 14, opacity: submitting ? 0.6 : 1, marginTop: 8 }}>
              {submitting ? '⏳ Publicando...' : '🚀 Publicar en el Feed'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
