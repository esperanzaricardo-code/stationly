'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Link from 'next/link'

function LoginForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  async function handleSubmit() {
    setError(''); setSuccess('')
    if (!email || !password) { setError('Rellena todos los campos'); return }
    if (mode === 'register' && !username) { setError('Elige un nombre de usuario'); return }
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/feed')
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username } }
        })
        if (error) throw error
        setSuccess('¡Cuenta creada! Revisa tu email para confirmar.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
    }}>
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

        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 50, padding: 4, marginBottom: 28 }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px', borderRadius: 50, border: 'none',
              background: mode === m ? 'linear-gradient(135deg, #CFFA7C, #9CE89D)' : 'transparent',
              color: mode === m ? '#0a0a0b' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {mode === 'register' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>Nombre de usuario</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="NightOwl, StreamQueen..."
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, padding: '11px 14px', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
          </div>
        )}

        {[
          { label: 'Email', type: 'email', value: email, set: setEmail, placeholder: 'tu@email.com' },
          { label: 'Contraseña', type: 'password', value: password, set: setPassword, placeholder: '••••••••' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>{f.label}</label>
            <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, padding: '11px 14px', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
          </div>
        ))}

        {error && <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', color: '#ff4d6d', fontSize: 13, padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ background: 'var(--tag-bg)', border: '1px solid var(--tag-border)', color: 'var(--tag-text)', fontSize: 13, padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>{success}</div>}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width: '100%', fontSize: 15, padding: 14, opacity: loading ? 0.6 : 1, marginTop: 8 }}>
          {loading ? '⏳ Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-dim)' }}>
          <Link href="/" style={{ color: 'var(--tag-text)', textDecoration: 'none' }}>← Volver al inicio</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <LoginForm />
    </ThemeProvider>
  )
}
