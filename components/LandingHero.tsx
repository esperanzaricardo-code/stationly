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
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section style={{
      position: 'relative', zIndex: 1,
      padding: '80px 32px 72px',
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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(32px, 4.8vw, 62px)',
          fontWeight: 700,
          lineHeight: 1.12,
          letterSpacing: '-0.5px',
          color: 'var(--text)',
          margin: '0 0 8px 0',
        }}>
          El setup de los mejores
        </h1>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(32px, 4.8vw, 62px)',
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'inline-block',
          transition: 'opacity 0.4s ease',
          opacity: visible ? 1 : 0,
        }}>
          {ROTATING_WORDS[wordIndex]}
        </div>
      </div>

      {/* Subtitle */}
      <p style={{
        color: 'var(--text-muted)', fontSize: 17, fontWeight: 300,
        maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.65,
        fontFamily: 'var(--font-body)',
      }}>
        Sube tu escritorio, etiqueta tus componentes con IA y comparte tu link en la bio.
        Tus viewers descubren exactamente con qué trabajas y juegas.
      </p>

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 64, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => document.dispatchEvent(new CustomEvent('stationly:open-upload'))} style={{ fontSize: 15, padding: '13px 28px' }}>
          📸 Subir mi Setup
        </button>
        <a href="#feed-section" className="btn-secondary" style={{ fontSize: 15, padding: '13px 28px' }}>
          Explorar setups ↓
        </a>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap', marginBottom: 72 }}>
        {[
          { num: setupCount || 8, label: 'Setups publicados' },
          { num: totalLikes || 2966, label: 'Likes totales' },
          { num: 247, label: 'Creadores' },
        ].map(({ num, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {num.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 3 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 860, margin: '0 auto' }}>
        {[
          { icon: '📸', title: 'Sube tu foto', desc: 'Arrastra la imagen de tu setup' },
          { icon: '🤖', title: 'IA detecta todo', desc: 'Claude identifica tus componentes automáticamente' },
          { icon: '🔗', title: 'Comparte tu link', desc: 'Tu página pública lista para la bio de Twitch o YouTube' },
        ].map((step, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '24px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>{step.icon}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{step.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
