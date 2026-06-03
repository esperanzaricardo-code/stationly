'use client'
import { useTheme } from './ThemeProvider'
import Link from 'next/link'

export default function LandingNav() {
  const { theme, toggle } = useTheme()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 64,
      background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Logo */}
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

      {/* Right side */}
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

        <Link href="/feed" className="btn-secondary" style={{ fontSize: 13 }}>
          Explorar setups
        </Link>

        <Link href="/login" style={{
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
          color: 'var(--text-muted)', textDecoration: 'none', padding: '9px 4px',
          transition: 'color 0.2s',
        }}>
          Iniciar sesión
        </Link>

        <Link href="/login" className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>
          Registrarse
        </Link>
      </div>
    </nav>
  )
}
