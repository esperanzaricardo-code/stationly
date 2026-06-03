use client
  export default function LandingFeatures() {
  const features = [
    {
      icon: '📸',
      title: 'Sube tu setup',
      desc: 'Arrastra tu foto y en segundos tienes tu página pública lista para compartir.',
    },
    {
      icon: '🤖',
      title: 'IA detecta todo',
      desc: 'Claude analiza tu foto e identifica automáticamente cada componente y periférico.',
    },
    {
      icon: '🔗',
      title: 'Links de afiliado',
      desc: 'Cada componente lleva a Amazon. Tus viewers compran y tú ganas comisión.',
    },
    {
      icon: '📡',
      title: 'Link para tu bio',
      desc: 'Una URL limpia para poner en Twitch, YouTube o Instagram. stationly.app/u/tunombre',
    },
    {
      icon: '🌍',
      title: 'Comunidad real',
      desc: 'Descubre los setups más populares, da likes y encuentra inspiración para el tuyo.',
    },
    {
      icon: '💸',
      title: 'Siempre gratis',
      desc: 'Sin planes de pago. Sube tu setup, comparte tu link y empieza a generar ingresos pasivos.',
    },
  ]

  return (
    <section style={{
      position: 'relative', zIndex: 1,
      padding: '80px 32px',
      maxWidth: 1400, margin: '0 auto',
    }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)',
          fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 12,
        }}>
          Todo lo que necesitas,<br />
          <span style={{
            background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>sin complicaciones</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
          Diseñado para creadores que quieren compartir su setup y monetizarlo sin esfuerzo.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '28px 24px',
            transition: 'border-color 0.2s, transform 0.2s',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--tag-border)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'none'
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              {f.title}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
