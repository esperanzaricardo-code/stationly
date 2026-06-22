'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Supabase redirige aquí con un token en la URL cuando el usuario
  // hace clic en el link del email. Hay dos modos:
  // 1. Sin sesión activa → mostrar formulario para pedir el email
  // 2. Con sesión activa (viene del link del email) → mostrar formulario para nueva contraseña
  const [mode, setMode] = useState<'request' | 'update'>('request')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    try {
      const root = document.documentElement
      root.style.setProperty('--accent',            '#CFFA7C')
      root.style.setProperty('--accent2',           '#9CE89D')
      root.style.setProperty('--accent-glow',       'rgba(207,250,124,0.25)')
      root.style.setProperty('--setup-accent',      '#CFFA7C')
      root.style.setProperty('--setup-accent2',     '#9CE89D')
      root.style.setProperty('--setup-accent-glow', 'rgba(207,250,124,0.25)')
      root.style.setProperty('--tag-bg',            'rgba(207,250,124,0.1)')
      root.style.setProperty('--tag-border',        'rgba(207,250,124,0.3)')
      root.style.setProperty('--tag-text',          '#CFFA7C')
    } catch {}
  }, [])

  // Detectar si venimos del link del email (Supabase añade #access_token en la URL)
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      // Supabase procesa el token del hash automáticamente y establece sesión
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setMode('update')
      })
    }
  }, [])

  async function handleRequest() {
    setError(''); setSuccess('')
    if (!email) { setError('Introduce tu email'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://stationly.app/reset-password',
      })
      if (error) throw error
      setSuccess('✉️ Te hemos enviado un email con el link para restablecer tu contraseña. Revisa tu bandeja de entrada.')
      setEmail('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate() {
    setError(''); setSuccess('')
    if (!password) { setError('Introduce una contraseña'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess('✅ Contraseña actualizada correctamente. Redirigiendo...')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 24, width: '100%', maxWidth: 420, padding: 40,
        boxShadow: 'var(--shadow-lg)', position: 'relative', zIndex: 1,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            Station<span style={{ background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ly</span>
          </span>
        </Link>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8, textAlign: 'center' }}>
          {mode === 'request' ? 'Recuperar contraseña' : 'Nueva contraseña'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
          {mode === 'request'
            ? 'Introduce tu email y te enviaremos un link para restablecer tu contraseña.'
            : 'Introduce tu nueva contraseña.'}
        </p>

        {mode === 'request' ? (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              onKeyDown={e => e.key === 'Enter' && handleRequest()}
              style={inputStyle}
            />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nueva contraseña</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                style={inputStyle}
              />
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5 }}>Mínimo 6 caracteres</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input
                type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                style={inputStyle}
              />
            </div>
          </>
        )}

        {error && (
          <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', color: '#ff4d6d', fontSize: 13, padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'var(--tag-bg)', border: '1px solid var(--tag-border)', color: 'var(--tag-text)', fontSize: 13, padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16, lineHeight: 1.6 }}>
            {success}
          </div>
        )}

        {!success && (
          <button
            onClick={mode === 'request' ? handleRequest : handleUpdate}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', fontSize: 15, padding: 14, opacity: loading ? 0.6 : 1, marginTop: 8 }}
          >
            {loading ? '⏳ Cargando...' : mode === 'request' ? 'Enviar link' : 'Guardar contraseña'}
          </button>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-dim)' }}>
          <Link href="/login" style={{ color: 'var(--tag-text)', textDecoration: 'none' }}>← Volver al login</Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </ThemeProvider>
  )
}
