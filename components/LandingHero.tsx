'use client'
import { useState, useEffect } from 'react'

const ROTATING_WORDS = ['streamers', 'gamers', 'creadores', 'developers', 'homeworkers']

export default function LandingHero({ setupCount, totalLikes }: { setupCount: number; totalLikes: number }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setWordIndex(i => (i + 1) % ROTATING_WORDS.length)
        setVisible(true)
      }, 300)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section style={{
      position: 'relative', zIndex: 1,
      padding: '80px 32px 64px',
      maxWidth: 1400, margin: '0 auto',
      textAlign: 'center',
    }}>
      {/* Eyebrow */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--tag-bg)', border: '1px solid var(--tag-border)',
        color: 'var(--tag-text)', fontSize: 11, fontWeight: 600,
        letterSpacing: '1.5px', textTransform: 'uppercase',
        padding: '5px 14px', borderRadius: 50, marginBottom: 28,
      }}>
        <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
        La red social de setups
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(40px, 6vw, 76px)',
        fontWeight: 800, lineHeight: 1.0,
        letterSpacing: '-2px', marginBottom: 12,
        color: 'var(--text)',
      }}>
        El setup de los mejores<br />
        <span style={{
          background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          display: 'inline-block',
          transition: 'opacity 0.3s',
          opacity: visible ? 1 : 0,
        }}>
          {ROTATING_WORDS[wordIndex]}
        </span>
      </h1>

      {/* Subtitle */}
      <p style={{
        color: 'var(--text-muted)', fontSize: 18, fontWeight: 300,
        maxWidth: 540, margin: '0 auto 40px',
        lineHeight: 1.65,
      }}>
        Sube tu escritorio, etiqueta tus componentes con IA y comparte tu link en la bio.
        Tus viewers descubren exactamente con qué trabajas y juegas.
      </p>

      {/* CTA buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 64, flexWrap: 'wrap' }}>
        <button
          className="btn-primary"
          onClick={() => document.dispatchEvent(new CustomEvent('stationly:open-upload'))}
          style={{ fontSize: 15, padding: '13px 28px' }}
        >
          📸 Subir mi Setup
        </button>
        <a href="#feed" className="btn-secondary" style={{ fontSize: 15, padding: '13px 28px' }}>
          Explorar setups ↓
        </a>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 48, flexWrap: 'wrap',
      }}>
        {[
          { num: setupCount || 8, label: 'Setups publicados' },
          { num: totalLikes || 2966, label: 'Likes totales' },
          { num: 247, label: 'Creadores' },
        ].map(({ num, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
              letterSpacing: '-1px', color: 'var(--text)',
              background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {num.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 2 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div id="feed" style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 900, margin: '80px auto 0' }}>
        {[
          { icon: '📸', title: 'Sube tu foto', desc: 'Arrastra la imagen de tu setup' },
          { icon: '🤖', title: 'IA detecta todo', desc: 'Claude identifica tus componentes automáticamente' },
          { icon: '🔗', title: 'Comparte tu link', desc: 'Tu página pública lista para la bio de Twitch o YouTube' },
        ].map((step, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '24px 20px',
            textAlign: 'center', transition: 'border-color 0.2s',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{step.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{step.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
