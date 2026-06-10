'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Link from 'next/link'

function WelcomeModal({ isFounder, onClose }: { isFounder: boolean; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        background: 'var(--surface)',
        border: `1px solid ${isFounder ? 'rgba(255,200,50,0.4)' : 'var(--border)'}`,
        borderRadius: 24, padding: 36, width: '100%', maxWidth: 400,
        textAlign: 'center',
        boxShadow: isFounder ? '0 0 40px rgba(255,200,50,0.15)' : 'var(--shadow-lg)',
        animation: 'welcome-in 0.3s ease',
      }}>
        {isFounder ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>★</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,200,50,0.15)', border: '1px solid rgba(255,200,50,0.4)', color: '#ffc832', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 50, marginBottom: 20, boxShadow: '0 0 12px rgba(255,200,50,0.3)', letterSpacing: '0.5px' }}>
              ★ Founder
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              Eres uno de los primeros
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 8 }}>
              Formas parte de los <strong style={{ color: 'var(--text)' }}>1.000 primeros usuarios</strong> de Stationly. Como agradecimiento, tu perfil lucirá para siempre el badge exclusivo de <strong style={{ color: '#ffc832' }}>★ Founder</strong>.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 28 }}>
              Gracias por confiar en el proyecto desde el principio. Esto es solo el comienzo.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              ¡Bienvenido a Stationly!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              Ya puedes subir tu setup, añadir componentes con IA y compartir tu página en tu bio de Twitch o YouTube.
            </p>
          </>
        )}
        <button onClick={onClose} className="btn-primary" style={{ width: '100%', fontSize: 14, padding: 13 }}>
          {isFounder ? '★ Empezar como Founder' : 'Empezar →'}
        </button>
      </div>
      <style>{`
        @keyframes welcome-in {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [welcomeModal, setWelcomeModal] = useState<{ show: boolean; isFounder: boolean } | null>(null)
  const router = useRouter()

  // La página de login siempre es verde lima
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

  function handleUsernameChange(value: string) {
    const clean = value.replace(/[^a-zA-Z0-9_-]/g, '')
    setUsername(clean)
  }

  async function handleSubmit() {
    setError(''); setSuccess('')
    if (!email || !password) { setError('Rellena todos los campos'); return }
    if (mode === 'register') {
      if (!username) { setError('Elige un nombre de usuario'); return }
      if (username.length < 3) { setError('El nombre de usuario debe tener al menos 3 caracteres'); return }
      if (username.length > 20) { setError('El nombre de usuario no puede tener más de 20 caracteres'); return }
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    }
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

        // Llamar a la función RPC para asignar Founder si es elegible
        const { data: isFounder } = await supabase.rpc('assign_founder_if_eligible', { p_username: username })
        setWelcomeModal({ show: true, isFounder: !!isFounder })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      if (msg.includes('Password should contain at least one character of each') || msg.includes('Password should be at least'))
        setError('password_requirements')
      else if (msg.includes('already registered') || msg.includes('already been registered'))
        setError('Este email ya tiene una cuenta. ¿Quieres iniciar sesión?')
      else if (msg.includes('Invalid login credentials'))
        setError('Email o contraseña incorrectos')
      else if (msg.includes('Email not confirmed'))
        setError('Confirma tu email antes de iniciar sesión')
      else
        setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleWelcomeClose() {
    setWelcomeModal(null)
    router.push('/feed')
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
    <>
      {welcomeModal?.show && (
        <WelcomeModal isFounder={welcomeModal.isFounder} onClose={handleWelcomeClose} />
      )}
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

          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 50, padding: 4, marginBottom: 28 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
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
              <label style={labelStyle}>Nombre de usuario</label>
              <input
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                placeholder="Ej: NightOwl, StreamQueen..."
                maxLength={20}
                style={inputStyle}
              />
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5 }}>
                Letras, números, - y _. Sin espacios. {username.length}/20
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle}
            />
            {mode === 'register' && (
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5 }}>
                Mínimo 6 caracteres
              </div>
            )}
          </div>

          {error === 'password_requirements' ? (
            <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', color: '#ff4d6d', fontSize: 13, padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>La contraseña debe incluir al menos:</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <li>Una letra minúscula (a-z)</li>
                <li>Una letra mayúscula (A-Z)</li>
                <li>Un número (0-9)</li>
                <li>Un símbolo (!@#$...)</li>
                <li>Mínimo 6 caracteres</li>
              </ul>
            </div>
          ) : error ? (
            <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', color: '#ff4d6d', fontSize: 13, padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              {error}
            </div>
          ) : null}

          {success && (
            <div style={{ background: 'var(--tag-bg)', border: '1px solid var(--tag-border)', color: 'var(--tag-text)', fontSize: 13, padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              {success}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} className="btn-primary"
            style={{ width: '100%', fontSize: 15, padding: 14, opacity: loading ? 0.6 : 1, marginTop: 8 }}>
            {loading ? '⏳ Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-dim)' }}>
            <Link href="/" style={{ color: 'var(--tag-text)', textDecoration: 'none' }}>← Volver al inicio</Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <Suspense>
        <LoginForm />
      </Suspense>
    </ThemeProvider>
  )
}
