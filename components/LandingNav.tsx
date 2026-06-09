'use client'
import { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LandingNav() {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (user) {
        setLoggedIn(true)
        setUsername(user.user_metadata?.username || user.email?.split('@')[0] || '')
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      if (user) {
        setLoggedIn(true)
        setUsername(user.user_metadata?.username || user.email?.split('@')[0] || '')
      } else {
        setLoggedIn(false)
        setUsername('')
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

useEffect(() => {
    try {
      const stored = 'lime'
    if (stored) {
      const map: Record<string, { accent: string; accent2: string; glow: string }> = {
        lime:   { accent: '#CFFA7C', accent2: '#9CE89D', glow: 'rgba(207,250,124,0.25)' },
        blue:   { accent: '#60a5fa', accent2: '#818cf8', glow: 'rgba(96,165,250,0.25)' },
        purple: { accent: '#c084fc', accent2: '#a855f7', glow: 'rgba(192,132,252,0.25)' },
        pink:   { accent: '#f472b6', accent2: '#fb7185', glow: 'rgba(244,114,182,0.25)' },
        orange: { accent: '#fb923c', accent2: '#fbbf24', glow: 'rgba(251,146,60,0.25)' },
        red:    { accent: '#f87171', accent2: '#ef4444', glow: 'rgba(248,113,113,0.25)' },
        cyan:   { accent: '#22d3ee', accent2: '#38bdf8', glow: 'rgba(34,211,238,0.25)' },
        yellow: { accent: '#fde047', accent2: '#facc15', glow: 'rgba(253,224,71,0.25)' },
      }
      const c = map[stored] || map.lime
      const root = document.documentElement
      root.style.setProperty('--accent', c.accent)
      root.style.setProperty('--accent2', c.accent2)
      root.style.setProperty('--accent-glow', c.glow)
      root.style.setProperty('--tag-bg', `rgba(${c.glow.slice(5,-1).split(',').slice(0,3).join(',')},0.1)`)
      root.style.setProperty('--tag-border', `rgba(${c.glow.slice(5,-1).split(',').slice(0,3).join(',')},0.3)`)
      root.style.setProperty('--tag-text', c.accent)
    }
  } catch {}
}, [])

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
        background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Logo + Beta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
              letterSpacing: '-0.5px', color: 'var(--text)',
            }}>
              Station<span style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>ly</span>
            </span>
          </Link>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--tag-bg)', border: '1px solid var(--tag-border)',
            color: 'var(--tag-text)', fontSize: 10, fontWeight: 700,
            letterSpacing: '1px', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 50, marginTop: 4,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'var(--accent)', display: 'inline-block',
              animation: 'pulse 2s ease infinite',
            }} />
            Beta
          </div>
        </div>

        {/* Desktop */}
        <div className="landing-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggle} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', width: 38, height: 38, borderRadius: '50%',
            fontSize: 16, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {loggedIn ? (
            <>
              <Link href={`/u/${username}`} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 50, padding: '6px 14px 6px 6px',
                textDecoration: 'none',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11,
                  color: '#0a0a0b',
                }}>
                  {username.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                  {username}
                </span>
              </Link>
              <Link href="/feed" className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>
                Ir al feed →
              </Link>
            </>
          ) : (
            <>
              <Link href="/feed" className="btn-secondary" style={{ fontSize: 13 }}>
                Explorar setups
              </Link>
              <Link href="/login" style={{
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                color: 'var(--text-muted)', textDecoration: 'none', padding: '9px 4px',
              }}>
                Iniciar sesión
              </Link>
              <Link href="/login" className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="landing-nav-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
          <button onClick={toggle} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', width: 36, height: 36, borderRadius: '50%',
            fontSize: 14, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setMenuOpen(o => !o)} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text)', width: 36, height: 36, borderRadius: '50%',
            fontSize: 18, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .landing-nav-desktop { display: none !important; }
            .landing-nav-mobile { display: flex !important; }
          }
        `}</style>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 10,
          boxShadow: 'var(--shadow-lg)',
        }}>
          {loggedIn ? (
            <>
              <Link href={`/u/${username}`} onClick={() => setMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px',
                textDecoration: 'none',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
                  color: '#0a0a0b',
                }}>
                  {username.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                  {username}
                </span>
              </Link>
              <Link href="/feed" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ fontSize: 14, padding: '12px', width: '100%', textAlign: 'center' }}>
                Ir al feed →
              </Link>
            </>
          ) : (
            <>
              <Link href="/feed" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ fontSize: 14, padding: '12px', width: '100%', textAlign: 'center' }}>
                Explorar setups
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ fontSize: 14, padding: '12px', width: '100%', textAlign: 'center' }}>
                Registrarse
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ fontSize: 14, padding: '12px', width: '100%', textAlign: 'center' }}>
                Iniciar sesión
              </Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
