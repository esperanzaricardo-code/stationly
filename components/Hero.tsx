export default function Hero({ setupCount, totalLikes }: { setupCount: number; totalLikes: number }) {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '64px 32px 48px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--tag-bg)', border: '1px solid var(--tag-border)',
        color: '#a98bff', fontSize: 11, fontWeight: 600, letterSpacing: '1.5px',
        textTransform: 'uppercase', padding: '5px 12px', borderRadius: 50, marginBottom: 20,
      }}>
        <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
        Red Social de Setups
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5vw,64px)',
        fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1.5px', marginBottom: 16,
      }}>
        Comparte tu<br />
        <span style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Setup Definitivo.</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 17, fontWeight: 300, maxWidth: 520, lineHeight: 1.6, marginBottom: 36 }}>
        La comunidad para streamers y creadores. Sube tu escritorio, etiqueta tus componentes y descubre los setups más épicos.
      </p>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {[
          { num: setupCount, label: 'Setups' },
          { num: totalLikes, label: 'Likes' },
          { num: 247, label: 'Creadores' },
        ].map(({ num, label }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>{num.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 400, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
