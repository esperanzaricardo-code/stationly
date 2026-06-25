'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Comment = {
  id: string
  setup_id: string
  user_id: string
  username: string
  body: string
  parent_id: string | null
  component_name: string | null
  pinned: boolean
  created_at: string
}

const AVATAR_GRADIENTS = [
  ['#CFFA7C', '#9CE89D'], ['#f43f5e', '#fb923c'], ['#06b6d4', '#6366f1'],
  ['#34d399', '#059699'], ['#fbbf24', '#f59e0b'], ['#60a5fa', '#3b82f6'],
  ['#f472b6', '#ec4899'], ['#9CE89D', '#CFFA7C'],
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

type Props = {
  setupId: string
  setupOwnerUsername: string
  isOwner: boolean
  isLoggedIn: boolean
  sessionToken: string
  currentUsername: string
  onRequireAuth: () => void
}

export default function Comments({ setupId, setupOwnerUsername, isOwner, isLoggedIn, sessionToken, currentUsername, onRequireAuth }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [reportingId, setReportingId] = useState<string | null>(null)
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set())
  const [reportReason, setReportReason] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const replyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { loadComments() }, [setupId])

  async function loadComments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?setup_id=${setupId}`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch {}
    setLoading(false)
  }

  async function submitComment(parentId?: string, text?: string) {
    const commentBody = parentId ? (text || replyBody) : body
    if (!commentBody.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ setup_id: setupId, body: commentBody, parent_id: parentId || null }),
      })
      const data = await res.json()
      if (res.ok && data.comment) {
        setComments(prev => [...prev, data.comment])
        if (parentId) { setReplyingTo(null); setReplyBody('') }
        else setBody('')
      }
    } catch {}
    setSubmitting(false)
  }

  async function deleteComment(commentId: string) {
    try {
      await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ comment_id: commentId, setup_owner_username: setupOwnerUsername }),
      })
      setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId))
    } catch {}
  }

  async function pinComment(commentId: string, pinned: boolean) {
    try {
      await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ comment_id: commentId, pinned, setup_id: setupId }),
      })
      setComments(prev => prev.map(c => ({
        ...c,
        pinned: c.id === commentId ? pinned : (pinned ? false : c.pinned),
      })))
    } catch {}
  }

  async function reportComment(commentId: string) {
    if (!reportReason.trim()) return
    try {
      await fetch('/api/comment-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ comment_id: commentId, reason: reportReason }),
      })
      setReportedIds(prev => new Set(Array.from(prev).concat(commentId)))
    } catch {}
    setReportingId(null)
    setReportReason('')
  }

  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Construir árbol de comentarios
  const topLevel = comments.filter(c => !c.parent_id).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
  const replies = (parentId: string) => comments.filter(c => c.parent_id === parentId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const totalCount = comments.length

  function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
    const isAuthor = currentUsername.toLowerCase() === comment.username.toLowerCase()
    const canDelete = isAuthor || isOwner
    const childReplies = replies(comment.id)
    const isCollapsed = collapsed.has(comment.id)
    const isReplying = replyingTo?.id === comment.id

    return (
      <div style={{ marginLeft: depth > 0 ? 32 : 0, position: 'relative' }}>
        {/* Línea vertical de hilo */}
        {depth > 0 && (
          <div style={{ position: 'absolute', left: -16, top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
        )}

        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: getAvatarGradient(comment.username),
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a0a0b', cursor: 'pointer',
            border: comment.pinned ? '1px solid var(--accent)' : 'none',
          }}>
            {comment.username.slice(0, 2).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Cabecera */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                {comment.username}
              </span>
              {comment.pinned && (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--tag-bg)', border: '1px solid var(--tag-border)', borderRadius: 50, padding: '1px 8px', letterSpacing: '0.05em' }}>
                  📌 fijado
                </span>
              )}
              {comment.component_name && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 50, padding: '1px 8px' }}>
                  {comment.component_name}
                </span>
              )}
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{timeAgo(comment.created_at)}</span>
            </div>

            {/* Cuerpo */}
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55, margin: '0 0 6px', wordBreak: 'break-word' }}>
              {comment.body}
            </p>

            {/* Acciones */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* Responder */}
              <button
                onClick={() => {
                  if (!isLoggedIn) { onRequireAuth(); return }
                  setReplyingTo(isReplying ? null : comment)
                  setReplyBody('')
                  setTimeout(() => replyRef.current?.focus(), 50)
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'var(--font-display)' }}
              >
                Responder
              </button>

              {/* Colapsar hilo */}
              {childReplies.length > 0 && (
                <button
                  onClick={() => toggleCollapse(comment.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                >
                  {isCollapsed ? `▶ Ver ${childReplies.length} respuesta${childReplies.length !== 1 ? 's' : ''}` : '▼ Ocultar'}
                </button>
              )}

              {/* Pinar — solo dueño del setup */}
              {isOwner && !comment.parent_id && (
                <button
                  onClick={() => pinComment(comment.id, !comment.pinned)}
                  style={{ background: 'transparent', border: 'none', color: comment.pinned ? 'var(--accent)' : 'var(--text-dim)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                >
                  {comment.pinned ? '📌 Despinar' : '📌 Fijar'}
                </button>
              )}

              {/* Reportar — solo si no es el autor y no está ya reportado */}
              {!isAuthor && !reportedIds.has(comment.id) && (
                <button
                  onClick={() => {
                    if (!isLoggedIn) { onRequireAuth(); return }
                    setReportingId(reportingId === comment.id ? null : comment.id)
                    setReportReason('')
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                >
                  ⚑ Reportar
                </button>
              )}
              {reportedIds.has(comment.id) && (
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Reportado</span>
              )}

              {/* Eliminar */}
              {canDelete && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,77,109,0.6)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                >
                  Eliminar
                </button>
              )}
            </div>

            {/* Form de reporte */}
            {reportingId === comment.id && (
              <div style={{ marginTop: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' }}>¿Por qué reportas este comentario?</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {['Spam', 'Contenido inapropiado', 'Acoso', 'Otro'].map(r => (
                    <button
                      key={r}
                      onClick={() => setReportReason(r)}
                      style={{
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 50, cursor: 'pointer',
                        background: reportReason === r ? 'var(--tag-bg)' : 'transparent',
                        border: reportReason === r ? '1px solid var(--tag-border)' : '1px solid var(--border)',
                        color: reportReason === r ? 'var(--tag-text)' : 'var(--text-muted)',
                      }}
                    >{r}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => reportComment(comment.id)}
                    disabled={!reportReason}
                    style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 50, cursor: 'pointer', background: 'rgba(255,77,109,0.15)', border: '1px solid rgba(255,77,109,0.3)', color: '#ff4d6d', opacity: reportReason ? 1 : 0.4 }}
                  >Enviar reporte</button>
                  <button
                    onClick={() => setReportingId(null)}
                    style={{ fontSize: 12, padding: '5px 14px', borderRadius: 50, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  >Cancelar</button>
                </div>
              </div>
            )}

            {/* Form de respuesta */}
            {isReplying && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <textarea
                  ref={replyRef}
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  placeholder={`Responder a ${comment.username}...`}
                  rows={2}
                  maxLength={500}
                  style={{
                    flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
                    padding: '8px 12px', borderRadius: 8, outline: 'none', resize: 'none',
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitComment(comment.id, replyBody) }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button
                    onClick={() => submitComment(comment.id, replyBody)}
                    disabled={submitting || !replyBody.trim()}
                    style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', border: 'none', color: '#0a0a0b', opacity: submitting || !replyBody.trim() ? 0.5 : 1 }}
                  >Enviar</button>
                  <button
                    onClick={() => { setReplyingTo(null); setReplyBody('') }}
                    style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  >Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Respuestas anidadas */}
        {!isCollapsed && childReplies.length > 0 && (
          <div style={{ marginLeft: 38 }}>
            {childReplies.map(reply => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ marginTop: 40 }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
          {totalCount > 0 ? `${totalCount} comentario${totalCount !== 1 ? 's' : ''}` : 'Comentarios'}
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Form nuevo comentario */}
      {isLoggedIn ? (
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: getAvatarGradient(currentUsername),
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0b',
          }}>
            {currentUsername.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <textarea
              ref={inputRef}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Escribe un comentario..."
              rows={2}
              maxLength={500}
              style={{
                flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
                padding: '8px 12px', borderRadius: 8, outline: 'none', resize: 'none',
              }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitComment() }}
            />
            <button
              onClick={() => submitComment()}
              disabled={submitting || !body.trim()}
              style={{
                fontSize: 13, fontWeight: 700, padding: '0 16px', borderRadius: 8,
                cursor: 'pointer', alignSelf: 'flex-end', height: 36,
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                border: 'none', color: '#0a0a0b',
                opacity: submitting || !body.trim() ? 0.5 : 1,
              }}
            >
              {submitting ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 24, textAlign: 'center', padding: '16px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <button onClick={onRequireAuth} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}>Inicia sesión</button>
            {' '}para comentar
          </span>
        </div>
      )}

      {/* Lista de comentarios */}
      {loading ? (
        <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Cargando...</div>
      ) : topLevel.length === 0 ? (
        <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
          Sé el primero en comentar este setup.
        </div>
      ) : (
        <div>
          {topLevel.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}
