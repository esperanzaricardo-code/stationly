'use client'
import { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Nav({ setupCount, totalLikes }: { setupCount?: number; totalLikes?: number }) {
  const { theme, toggle } = useTheme()
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

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

  function handleUpload() {
    setMenuOpen(false)
    if (loggedIn) {
      document.dispatchEvent(new CustomEvent('stationly:open-upload'))
    } else {
      router.push('/login')
    }
  }

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
        background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <Link href={loggedIn ? '/feed' : '/'} style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
            letterSpacing: '-0.5px', color: 'var(--text)',
          }}>
            Station<span style={{
              background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>ly</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11,
                  color: '#0a0a0b', flexShrink: 0,
                }}>
                  {username.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                  {username}
                </span>
              </Link>
              <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="btn-secondary" style={{ fontSize: 13 }}>
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-secondary" style={{ fontSize: 13 }}>
              Iniciar sesión
            </Link>
          )}

          <button className="btn-primary" onClick={handleUpload} style={{ fontSize: 13, padding: '9px 18px' }}>
            <span>📸</span> Subir Setup
          </button>
        </div>

        {/* Mobile — hamburguesa */}
        <div className="nav-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
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
            .nav-desktop { display: none !important; }
            .nav-mobile { display: flex !important; }
          }
        `}</style>
      </nav>

      {/* Mobile menu desplegable */}
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
                  background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
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
              <button onClick={handleUpload} className="btn-primary" style={{ fontSize: 14, padding: '12px', width: '100%' }}>
                📸 Subir Setup
              </button>
              <button onClick={() => { setMenuOpen(false); supabase.auth.signOut().then(() => router.push('/')) }} className="btn-secondary" style={{ fontSize: 14, padding: '12px', width: '100%' }}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ fontSize: 14, padding: '12px', width: '100%', textAlign: 'center' }}>
                Iniciar sesión
              </Link>
              <button onClick={handleUpload} className="btn-secondary" style={{ fontSize: 14, padding: '12px', width: '100%' }}>
                📸 Subir Setup
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
