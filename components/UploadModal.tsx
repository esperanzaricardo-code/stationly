'use client'
import { useEffect, useRef, useState } from 'react'
import ImageCropper from './ImageCropper'
import { supabase } from '@/lib/supabase'

export default function UploadModal() {
  const [open, setOpen] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [rawPreview, setRawPreview] = useState<string | null>(null)
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [dragover, setDragover] = useState(false)
  const [userName, setUserName] = useState('')
  const [sessionToken, setSessionToken] = useState('')
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const open = () => setOpen(true)
    document.addEventListener('stationly:open-upload', open)
    return () => document.removeEventListener('stationly:open-upload', open)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (user) {
        setUserName(user.user_metadata?.username || user.email?.split('@')[0] || '')
        setSessionToken(data.session?.access_token || '')
      }
    })
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
    if (fileRef.current) fileRef.current.value = ''
  }

  function closeModal() {
    setOpen(false); clearImage()
    setTitle(''); setSubmitting(false)
  }

  async function submitSetup() {
    if (!userName.trim()) { alert('No se pudo obtener tu nombre de usuario. ¿Estás logueado?'); return }
    if (!title.trim()) { alert('Ponle un nombre a tu setup'); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('user_name', userName.trim())
      fd.append('session_token', sessionToken)
      fd.append('title', title.trim())
      fd.append('category', 'workstation')
      fd.append('tags', JSON.stringify([]))

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
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 520, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
        <button onClick={closeModal} style={{ position: 'absolute', top: 20, right: 20, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6, color: 'var(--text)' }}>Sube tu Setup</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Foto + título y listo. Añade los componentes después desde tu perfil.</p>

        {/* Quién publica */}
        {!showCropper && (
          <div style={{ marginBottom: 20, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#0a0a0b', flexShrink: 0 }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Publicando como</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{userName}</div>
            </div>
          </div>
        )}

        {/* Drop zone */}
        {!rawPreview && !croppedPreview && (
          <div
            onDragOver={e => { e.preventDefault() }}
            onDragLeave={() => {}}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${dragover ? 'var(--accent)' : 'var(--border-strong)'}`, borderRadius: 'var(--radius)', background: 'var(--surface2)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', marginBottom: 20, transition: 'all 0.2s' }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div style={{ fontSize: 36, marginBottom: 10 }}>🖼️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Arrastra tu foto aquí o haz clic</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>PNG, JPG, WEBP · Máx 10MB</div>
          </div>
        )}

        {/* Cropper */}
        {showCropper && rawPreview && (
          <ImageCropper src={rawPreview} onCrop={handleCropDone} onCancel={handleCropCancel} />
        )}

        {/* Preview recortada */}
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

        {/* Título */}
        {!showCropper && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nombre del Setup</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: The Cyberpunk Lair..."
                style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && submitSetup()}
              />
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16, lineHeight: 1.5 }}>
              💡 Una vez publicado podrás añadir los componentes con sus links desde tu perfil.
            </p>

            <button onClick={submitSetup} disabled={submitting} className="btn-primary" style={{ width: '100%', fontSize: 15, padding: 14, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? '⏳ Publicando...' : '🚀 Publicar en el Feed'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
