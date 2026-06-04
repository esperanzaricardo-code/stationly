'use client'

export default function LandingFeatures() {
  const features = [
    {
      num: '01',
      icon: '📸',
      title: 'Todo en un sitio',
      desc: 'Sube una foto de tu setup, añade tus componentes y tendrás una página pública lista para compartir. Nunca más respondas las mismas preguntas del chat.',
    },
    {
      num: '02',
      icon: '✦',
      title: 'Detección automática',
      desc: 'Nuestra IA identifica cada periférico y componente de tu foto automáticamente y los enlaza a tiendas. Tú solo confirmas.',
    },
    {
      num: '03',
      icon: '🔗',
      title: 'Gana sin esfuerzo',
      desc: 'Cada componente lleva un link de compra. Cuando alguien de tu audiencia compra algo de tu setup, tú te llevas una comisión sin hacer nada extra.',
    },
  ]

  return (
    <section style={{
      position: 'relative', zIndex: 1,
      padding: '80px 32px',
      maxWidth: 1100, margin: '0 auto',
    }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)',
          fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 12,
        }}>
          Tu setup, todo en un sitio.<br />
          <span style={{
            background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Sin complicaciones.</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
          Diseñado para streamers y creadores que están hartos de responder siempre las mismas preguntas.
        </p>
      </div>

      {/* Grid de 3 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
      }}
        className="features-grid"
      >
        <style>{`
          @media (max-width: 768px) {
            .features-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {features.map((f, i) => (
          <div key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '32px 28px',
              textAlign: 'center',
              transition: 'border-color 0.2s, transform 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--tag-border)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'none'
            }}
          >
            {/* Número decorativo */}
            <div style={{
              position: 'absolute', top: 16, right: 20,
              fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800,
              color: 'var(--border-strong)', lineHeight: 1, userSelect: 'none',
            }}>
              {f.num}
            </div>

            {/* Icono */}
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
              background: 'var(--tag-bg)', border: '1px solid var(--tag-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              {f.icon}
            </div>

            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800,
              color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.3px',
            }}>
              {f.title}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
