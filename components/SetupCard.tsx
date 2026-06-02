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

const PLACEHOLDER_COLORS = [
  ['#1a1a2e','#16213e','#0f3460'], ['#0d0d0d','#1a0a2e','#2a0a4e'],
  ['#0a1628','#0e2040','#1a3a6e'], ['#0f0f0f','#1a1a0a','#2a2a0a'],
  ['#1a0a0a','#2e1616','#3e1a1a'], ['#0a0a1a','#1a1a3e','#2a2a5e'],
]
const ICONS = ['⌨️','🖥️','🖱️','💡','🎧','📷','🎮','🖨️']

function PlaceholderImg({ user }: { user: string }) {
  const h = hashStr(user)
  const [c1, c2, c3] = PLACEHOLDER_COLORS[h % PLACEHOLDER_COLORS.length]
  const icon = ICONS[h % ICONS.length]
  return (
    <div style={{ width: '100%', paddingBottom: '70%', position: 'relative', background: `linear-gradient(135deg, ${c1}, ${c2}, ${c3})` }}>
      <span style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', fontSize: 32 }}>{icon}</span>
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora mismo'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export default function SetupCard({ setup }: { setup: Setup }) {
  const [likes, setLikes] = useState(setup.likes || 0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)

  async function toggleLike(e: React.MouseEvent) {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    const newLiked = !liked
    setLiked(newLiked)
    setLikes(l => l + (newLiked ? 1 : -1))
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: setup.id, action: newLiked ? 'like' : 'unlike' }),
      })
      const data = await res.json()
      if (data.likes !== undefined) setLikes(data.likes)
    } catch {
      setLiked(!newLiked)
      setLikes(l => l + (newLiked ? -1 : 1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        breakInside: 'avoid', marginBottom: 16,
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.2), 0 0 0 1px var(--accent)' : 'var(--shadow)',
        transition: 'transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s, border-color 0.25s',
        animation: 'cardIn 0.5s cubic-bezier(.4,0,.2,1) both',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--surface3)' }}>
        {setup.image_url ? (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
            <Image
              src={setup.image_url} alt={setup.title} fill
              style={{ objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)' }}
              sizes="(max-width: 540px) 100vw, (max-width: 860px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        ) : (
          <PlaceholderImg user={setup.user_name} />
        )}
        {hovered && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: getAvatarGradient(setup.user_name),
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0a0a0b', flexShrink: 0,
            }}>
              {setup.user_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{setup.user_name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{timeAgo(setup.created_at)}</div>
            </div>
          </div>

          <button
            onClick={toggleLike}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: liked ? 'rgba(255,77,109,0.1)' : 'transparent',
              border: `1px solid ${liked ? 'rgba(255,77,109,0.5)' : 'var(--border)'}`,
              color: liked ? 'var(--like)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
              padding: '5px 10px', borderRadius: 50, cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            <span style={{ fontSize: 13, transition: 'transform 0.2s', transform: liked ? 'scale(1.25)' : 'scale(1)' }}>
              {liked ? '♥' : '♡'}
            </span>
            {likes}
          </button>
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 8, lineHeight: 1.3, color: 'var(--text)' }}>
          {setup.title}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {(setup.tags || []).map((tag, i) => (
            <span key={i} style={{
              background: 'var(--tag-bg)', border: '1px solid var(--tag-border)',
              color: 'var(--tag-text)', fontSize: 10, fontWeight: 500,
              padding: '3px 9px', borderRadius: 50, letterSpacing: '0.3px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
