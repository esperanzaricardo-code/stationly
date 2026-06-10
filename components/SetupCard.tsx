'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Setup } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toastInfo } from './Toast'
import ReportModal from './ReportModal'

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

export default function SetupCard({ setup }: { setup: Setup }) {
  const router = useRouter()
  const [likes, setLikes] = useState(setup.likes || 0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [reported, setReported] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sessionToken, setSessionToken] = useState('')
  const [currentUser, setCurrentUser] = useState('')

  useEffect(() => {
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data }) => {
        const user = data.session?.user
        if (user) {
          const token = data.session?.access_token || ''
          setIsLoggedIn(true)
          setSessionToken(token)
          const uname = user.user_metadata?.username || user.email?.split('@')[0] || ''
          setCurrentUser(uname)

          // Cargar si ya reportó este setup via API
          fetch('/api/reports', {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(r => r.json())
            .then(({ reportedIds }) => {
              if (reportedIds?.includes(setup.id)) setReported(true)
            })
            .catch(() => {})
        }
      })
    })
  }, [setup.id])

  const isOwn = currentUser && currentUser.toLowerCase() === setup.user_name.toLowerCase()

  function handleCardClick() {
    router.push(`/u/${encodeURIComponent(setup.user_name)}?setup=${setup.id}`)
  }

  async function toggleLike(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isLoggedIn) {
      document.dispatchEvent(new CustomEvent('stationly:require-auth'))
      return
    }
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

  function handleReportClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isLoggedIn) {
      document.dispatchEvent(new CustomEvent('stationly:require-auth'))
      return
    }
    setShowReportModal(true)
  }

  async function handleReport(reason: string) {
    setShowReportModal(false)
    if (reported) return
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: setup.id, sessionToken, reason }),
      })
    } catch {}
    setReported(true)
    // Notificar al feed para que oculte este setup inmediatamente
    document.dispatchEvent(new CustomEvent('stationly:reported', { detail: setup.id }))
    toastInfo('Setup reportado. Gracias por ayudarnos a mantener la comunidad.')
  }

  return (
    <>
      {showReportModal && (
        <ReportModal
          onConfirm={handleReport}
          onCancel={() => setShowReportModal(false)}
        />
      )}
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          breakInside: 'avoid', marginBottom: 16,
          background: 'var(--surface)',
          border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.2)' : 'var(--shadow)',
          transition: 'transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s, border-color 0.25s',
          animation: 'cardIn 0.5s cubic-bezier(.4,0,.2,1) both',
          position: 'relative',
        }}
      >
        {/* Report button — solo si no es propio y no ha reportado */}
        {hovered && !isOwn && !reported && (
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
            <button
              onClick={handleReportClick}
              title="Reportar contenido"
              style={{
                background: 'rgba(0,0,0,0.6)', border: 'none', color: 'rgba(255,255,255,0.6)',
                width: 28, height: 28, borderRadius: '50%', fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              ⚑
            </button>
          </div>
        )}

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
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: getAvatarGradient(setup.user_name),
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#0a0a0b',
              }}>
                {setup.user_name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                  color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {setup.user_name}
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--text-dim)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {setup.title}
                </div>
              </div>
            </div>

            <button
              onClick={toggleLike}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                background: liked ? 'rgba(255,77,109,0.1)' : 'transparent',
                border: `1px solid ${liked ? 'rgba(255,77,109,0.5)' : 'var(--border)'}`,
                color: liked ? 'var(--like)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                padding: '5px 10px', borderRadius: 50, cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              <span style={{ fontSize: 12, transition: 'transform 0.2s', transform: liked ? 'scale(1.25)' : 'scale(1)' }}>
                {liked ? '♥' : '♡'}
              </span>
              {likes}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
