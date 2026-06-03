import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer style={{
      position: 'relative', zIndex: 1,
      borderTop: '1px solid var(--border)',
      padding: '40px 32px',
      maxWidth: 1400, margin: '0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16,
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
        letterSpacing: '-0.5px', color: 'var(--text)',
      }}>
        Station<span style={{
          background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>ly</span>
      </span>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <Link href="/feed" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Explorar</Link>
        <Link href="/login" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Iniciar sesión</Link>
        <Link href="/login" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Registrarse</Link>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
        © 2025 Stationly. Hecho para creadores.
      </p>
    </footer>
  )
}
