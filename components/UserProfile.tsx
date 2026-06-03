'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Setup } from '@/lib/supabase'

const AVATAR_GRADIENTS = [
  ['#CFFA7C','#9CE89D'], ['#f43f5e','#fb923c'], ['#06b6d4','#6366f1'],
  ['#34d399','#059669'], ['#fbbf24','#f59e0b'], ['#9CE89D','#CFFA7C'],
  ['#60a5fa','#3b82f6'], ['#f472b6','#ec4899'],
]

function hashStr(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function getAvatarGradient(user: string) {
  const [a, b] = AVATAR_GRADIENTS[hashStr(user) % AVATAR_GRADIENTS.length]
  return `linear-gradient(135deg, ${a}, ${b})`
}

function makeAmazonLink(component: string) {
  const query = encodeURIComponent(component)
  // When affiliate ID is ready, add: &tag=YOUR_AFFILIATE_ID
  return `https://www.amazon.es/s?k=${query}`
}

function totalLikes(setups: Setup[]) {
  return setups.reduce((a, s) => a + (s.likes || 0), 0)
}

function totalComponents(setups: Setup[]) {
  return setups.reduce((a, s) => a + (s.tags?.length || 0), 0)
}

type Props = { setups: Setup[]; username: string }

export default function UserProfile({ setups, username }: Props) {
  const [activeSetup, setActiveSetup] = useState(0)
  const setup = setups[activeSetup]

  const PLACEHOLDER_COLORS = [
    ['#1a1a2e','#16213e','#0f3460'], ['#0d0d0d','#1a0a2e','#2a0a4e'],
    ['#0a1628','#0e2040','#1a3a6e'],
  ]
  const pc = PLACEHOLDER_COLORS[hashStr(username) % PLACEHOLDER_COLORS.length]

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    alert('¡Link copiado!')
  }

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* ── Profile header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20,
        marginBottom: 36, flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
          background: getAvatarGradient(username),
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0a0a0b', border: '3px solid var(--accent)',
          boxShadow: '0 0 20px var(--accent-glow)',
        }}>
          {username.slice(0, 2).toUpperCase()}
        </div>

        {/* Name + stats */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
            letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 4,
          }}>
            {username}
          </h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { num: setups.length, label: setups.length === 1 ? 'Setup' : 'Setups' },
              { num: totalComponents(setups), label: 'Componentes' },
              { num: totalLikes(setups), label: 'Likes' },
            ].map(({ num, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{num}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share button */}
        <button onClick={copyLink} className="btn-primary" style={{ fontSize: 13, padding: '9px 18px', flexShrink: 0 }}>
          🔗 Copiar link
        </button>
      </div>

      {/* ── Setup tabs (if multiple) ── */}
      {setups.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {setups.map((s, i) => (
            <button key={s.id} onClick={() => setActiveSetup(i)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 50, border: 'none',
            background: activeSetup === i ? 'linear-gradient(135deg, #CFFA7C, #9CE89D)' : 'var(--surface2)',
border: activeSetup === i ? 'none' : '1px solid var(--border)',
color: activeSetup === i ? '#0a0a0b' : 'var(--text-muted)',
fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
cursor: 'pointer', transition: 'all 0.18s',
} as React.CSSProperties}>
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* ── Setup image ── */}
      <div style={{
        width: '100%', aspectRatio: '4/3', borderRadius: 'var(--radius)',
        overflow: 'hidden', marginBottom: 28,
        border: '1px solid var(--border)',
        background: `linear-gradient(135deg, ${pc[0]}, ${pc[1]}, ${pc[2]})`,
        position: 'relative',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {setup.image_url ? (
          <Image
            src={setup.image_url} alt={setup.title} fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 900px) 100vw, 900px"
            priority
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
            🖥️
          </div>
        )}
        {/* Setup title overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '32px 24px 20px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            {setup.title}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            {setup.category} · {setup.tags?.length || 0} componentes
          </div>
        </div>
      </div>

      {/* ── Components list ── */}
      {setup.tags && setup.tags.length > 0 && (
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800,
            color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 16,
          }}>
            🛒 Componentes del Setup
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {setup.tags.map((tag, i) => (
              <a
                key={i}
                href={makeAmazonLink(tag)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '14px 18px',
                  textDecoration: 'none', transition: 'all 0.18s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)'
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(4px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: 'var(--tag-bg)', border: '1px solid var(--tag-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    🖥️
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {tag}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      Ver en Amazon →
                    </div>
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #CFFA7C, #9CE89D)',
                  color: '#0a0a0b', fontSize: 10, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 50, letterSpacing: '0.5px',
                  flexShrink: 0,
                }}>
                  AMAZON
                </div>
              </a>
            ))}
          </div>

          {/* Affiliate disclaimer */}
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 16, lineHeight: 1.5 }}>
            Los links llevan a Amazon. Si compras a través de ellos podemos recibir una pequeña comisión sin coste adicional para ti.
          </p>
        </div>
      )}
    </div>
  )
}
