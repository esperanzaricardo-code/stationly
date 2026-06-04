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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  function handleUpload() {
    if (loggedIn) {
      document.dispatchEvent(new CustomEvent('stationly:open-upload'))
    } else {
      router.push('/login')
    }
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 64,
      background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', width: 38, height: 38, borderRadius: '50%',
            fontSize: 16, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {loggedIn ? (
          <button
            onClick={() => {
              supabase.auth.signOut().then(() => router.push('/'))
            }}
            className="btn-secondary"
            style={{ fontSize: 13 }}
          >
            Cerrar sesión
          </button>
        ) : (
          <Link href="/login" className="btn-secondary" style={{ fontSize: 13 }}>
            Iniciar sesión
          </Link>
        )}

        <button
          className="btn-primary"
          onClick={handleUpload}
          style={{ fontSize: 13, padding: '9px 18px' }}
        >
          <span>📸</span> Subir Setup
        </button>
      </div>
    </nav>
  )
}
