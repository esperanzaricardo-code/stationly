'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Setup } from '@/lib/supabase'

const AVATAR_GRADIENTS = [
  ['#7c5cfc','#e040fb'], ['#f43f5e','#fb923c'], ['#06b6d4','#6366f1'],
  ['#34d399','#059669'], ['#fbbf24','#f59e0b'], ['#e040fb','#7c5cfc'],
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

function getTagStyle(tag: string) {
  const l = tag.toLowerCase()
  if (['rtx','rx ','gpu','radeon','nvidia','geforce'].some(k => l.includes(k)))
    return { bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.35)', color: '#fb923c' }
  if (['elgato','stream deck','shure','rode','capture'].some(k => l.includes(k)))
    return { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.35)', color: '#34d399' }
  return { bg: 'var(--tag-bg)', border: 'var(--tag-border)', color: '#a98bff' }
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
    <div style={{
      width: '100%', paddingBottom: '70%', position: 'relative',
      background: `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`,
    }}>
      <span style={{
        position: 'absolute', bottom: 12, left: '50%',
        transform: 'translateX(-50%)', fontSize: 32,
      }}>{icon}</span>
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
    const action = liked ? 'unlike' : 'like'
    const newLiked = !liked
    const newLikes = likes + (newLiked ? 1 : -1)
    setLiked(newLiked)
    setLikes(newLikes)
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: setup.id, action }),
      })
      const data = await res.json()
      if (data.likes !== undefined) setLikes(data.likes)
    } catch {
      setLiked(!newLiked)
      setLikes(likes)
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
        background: 'var(--surface)', border: `1px solid ${hovered ? 'rgba(124,92,252,0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,252,0.2)' : 'none',
        transition: 'transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s, border-color 0.25s',
        animation: 'cardIn 0.5s cubic-bezier(.4,0,.2,1) both',
      }}
    >
      <style>{`@keyframes cardIn { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--surface3)' }}>
        {setup.image_url ? (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
            <Image
              src={setup.image_url}
              alt={setup.title}
              fill
              style={{ objectFit: 'cover', transition: hovered ? 'transform 0.4s cubic-bezier(.4,0,.2,1)' : 'none', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
              sizes="(max-width: 540px) 100vw, (max-width: 860px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        ) : (
          <PlaceholderImg user={setup.user_name} />
        )}
        {hovered && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
        )}
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: getAvatarGradient(setup.user_name),
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0,
            }}>
              {setup.user_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}>{setup.user_name}</div>
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
              padding: '5px 10px', borderRadius: 50, cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >
            <span style={{ fontSize: 13, transition: 'transform 0.2s', transform: liked ? 'scale(1.25)' : 'scale(1)' }}>
              {liked ? '♥' : '♡'}
            </span>
            {likes}
          </button>
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 8, lineHeight: 1.3 }}>
          {setup.title}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {(setup.tags || []).map((tag, i) => {
            const s = getTagStyle(tag)
            return (
              <span key={i} style={{
                background: s.bg, border: `1px solid ${s.border}`, color: s.color,
                fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 50, letterSpacing: '0.3px',
              }}>
                {tag}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
