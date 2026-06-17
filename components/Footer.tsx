import Link from 'next/link'
export default function Footer() {
  return (
    <footer style={{
      position: 'relative', zIndex: 1,
      background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      padding: '32px 24px',
      marginTop: 40,
    }}>
      <div style={{
        maxWidth: 1800, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
          letterSpacing: '-0.5px', color: 'var(--text)',
        }}>
          Station<span style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>ly</span>
        </span>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/legal/privacidad" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacidad</Link>
          <Link href="/legal/terminos" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Términos</Link>
          <Link href="/legal/cookies" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Cookies</Link>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          © 2026 Stationly
        </p>
      </div>
    </footer>
  )
}
