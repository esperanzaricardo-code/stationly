'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const ROTATING_WORDS = ['streamers', 'gamers', 'creadores', 'developers', 'homeworkers']

export default function LandingHero() {
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
      padding: '100px 32px 80px',
      maxWidth: 1400, margin: '0 auto',
      textAlign: 'center',
    }}>
      {/* Eyebrow */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--tag-bg)', border: '1px solid var(--tag-border)',
        color: 'var(--tag-text)', fontSize: 11, fontWeight: 600,
        letterSpacing: '1.5px', textTransform: 'uppercase',
        padding: '5px 14px', borderRadius: 50, marginBottom: 32,
      }}>
        <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
        La red social de setups
      </div>

      {/* Title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 4.8vw, 62px)',
          fontWeight: 800, lineHeight: 1.12,
          letterSpacing: '-0.5px', color: 'var(--text)',
          margin: '0 0 8px 0',
        }}>
          El setup de los mejores
        </h1>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 4.8vw, 62px)',
          fontWeight: 800, lineHeight: 1.3,
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', display: 'inline-block',
          transition: 'opacity 0.4s ease',
          opacity: visible ? 1 : 0,
        }}>
          {ROTATING_WORDS[wordIndex]}
        </div>
      </div>

      {/* Subtitle */}
      <p style={{
        color: 'var(--text-muted)', fontSize: 18, fontWeight: 300,
        maxWidth: 540, margin: '0 auto 44px', lineHeight: 1.65,
      }}>
        Sube tu escritorio, etiqueta tus componentes con IA y comparte tu link en la bio.
        Tus viewers descubren exactamente con qué trabajas y juegas.
      </p>

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 80, flexWrap: 'wrap' }}>
        <Link href="/login" className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
          Empezar gratis →
        </Link>
        <Link href="/feed" className="btn-secondary" style={{ fontSize: 15, padding: '14px 32px' }}>
          Ver setups de la comunidad
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, flexWrap: 'wrap' }}>
        {[
          { num: '100%', label: 'Gratis para siempre' },
          { num: 'IA', label: 'Detección automática' },
          { num: '🔗', label: 'Link para tu bio' },
        ].map(({ num, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
              background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {num}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 4 }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
