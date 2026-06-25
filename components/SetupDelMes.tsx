'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Contest = {
  id: string
  title: string
  theme: string
  theme_tag: string
  starts_at: string
  ends_at: string
  active: boolean
}

type Setup = {
  id: string
  user_name: string
  title: string
  image_url: string | null
  category: string | null
}

type SetupWithVotes = Setup & { voteCount: number }

type Winner = {
  position: 1 | 2 | 3
  votes: number
  setup: Setup
}

type HistoryEntry = {
  contest: Contest
  winners: Winner[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  ['#CFFA7C', '#9CE89D'], ['#f43f5e', '#fb923c'], ['#06b6d4', '#6366f1'],
  ['#34d399', '#059669'], ['#fbbf24', '#f59e0b'], ['#9CE89D', '#CFFA7C'],
  ['#60a5fa', '#3b82f6'], ['#f472b6', '#ec4899'],
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

const POSITION_COLORS = {
  1: { border: '#C9A84C', badge: '#C9A84C', badgeBg: 'rgba(201,168,76,0.12)', label: '1ª posición' },
  2: { border: '#9BA3AF', badge: '#9BA3AF', badgeBg: 'rgba(155,163,175,0.12)', label: '2ª posición' },
  3: { border: '#9C6B3C', badge: '#9C6B3C', badgeBg: 'rgba(156,107,60,0.12)', label: '3ª posición' },
}

// ─── Tarjeta de ganador ───────────────────────────────────────────────────────

function WinnerCard({
  winner,
  large = false,
  contestTitle,
}: {
  winner: Winner
  large?: boolean
  contestTitle: string
}) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const pos = POSITION_COLORS[winner.position]

  return (
    <div
      onClick={() => router.push(`/u/${encodeURIComponent(winner.setup.user_name)}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`${pos.label} • ${contestTitle}`}
      style={{
        cursor: 'pointer',
        borderRadius: 'var(--radius)',
        border: `1px solid ${hovered ? pos.border : pos.border + '80'}`,
        background: 'var(--surface)',
        overflow: 'hidden',
        transition: 'transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s, border-color 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 16px 48px rgba(0,0,0,0.25)` : 'var(--shadow)',
        flex: large ? undefined : 1,
        minWidth: 0,
        position: 'relative',
      }}
    >
      {/* Imagen */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: large ? '16/9' : '4/3', background: 'var(--surface3)', overflow: 'hidden' }}>
        {winner.setup.image_url ? (
          <Image
            src={winner.setup.image_url}
            alt={winner.setup.title}
            fill
            style={{ objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)' }}
            sizes={large ? '(max-width: 900px) 100vw, 800px' : '(max-width: 900px) 50vw, 400px'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--surface2)' }} />
        )}
        {hovered && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
        )}
        {/* Tooltip hover */}
        {hovered && (
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            borderRadius: 8, padding: '5px 12px',
            fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700,
            color: pos.badge, whiteSpace: 'nowrap',
            border: `1px solid ${pos.border}40`,
          }}>
            {pos.label} • {contestTitle}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: large ? '14px 16px' : '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{
            width: large ? 34 : 28, height: large ? 34 : 28,
            borderRadius: '50%', flexShrink: 0,
            background: getAvatarGradient(winner.setup.user_name),
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: large ? 12 : 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a0a0b',
          }}>
            {winner.setup.user_name.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: large ? 14 : 12, fontWeight: 700,
              color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {winner.setup.user_name}
            </div>
            <div style={{ fontSize: large ? 12 : 10, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {winner.setup.title}
            </div>
          </div>
        </div>
        <div style={{
          flexShrink: 0, fontSize: large ? 13 : 11,
          fontFamily: 'var(--font-display)', fontWeight: 700,
          color: 'var(--text-muted)',
        }}>
          {winner.votes} votos
        </div>
      </div>
    </div>
  )
}

// ─── Tarjeta de candidato con botón de voto ───────────────────────────────────

function CandidateCard({
  setup,
  voted,
  isLoggedIn,
  onVote,
}: {
  setup: SetupWithVotes
  voted: boolean
  isLoggedIn: boolean
  onVote: (id: string) => void
}) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        breakInside: 'avoid', marginBottom: 16,
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', overflow: 'hidden',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.2)' : 'var(--shadow)',
        transition: 'transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s, border-color 0.25s',
        cursor: 'pointer',
      }}
      onClick={() => router.push(`/u/${encodeURIComponent(setup.user_name)}`)}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: 'var(--surface3)', overflow: 'hidden' }}>
        {setup.image_url ? (
          <Image
            src={setup.image_url} alt={setup.title} fill
            style={{ objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s' }}
            sizes="(max-width: 860px) 50vw, 25vw"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--surface2)' }} />
        )}
        {hovered && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)' }} />}
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: getAvatarGradient(setup.user_name),
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0b',
          }}>
            {setup.user_name.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {setup.user_name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {setup.title}
            </div>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onVote(setup.id) }}
          style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 4,
            background: voted ? 'rgba(207,250,124,0.1)' : 'transparent',
            border: `1px solid ${voted ? 'var(--accent)' : 'var(--border)'}`,
            color: voted ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
            padding: '5px 10px', borderRadius: 50, cursor: 'pointer', transition: 'all 0.18s',
          }}
        >
          <span style={{ fontSize: 12 }}>{voted ? '★' : '☆'}</span>
          {setup.voteCount}
        </button>
      </div>
    </div>
  )
}

// ─── Vista de un concurso (activo o histórico) ────────────────────────────────

function ContestView({
  contest,
  winners,
  candidates,
  votedIds,
  isLoggedIn,
  onVote,
  isHistory = false,
}: {
  contest: Contest
  winners: Winner[]
  candidates: SetupWithVotes[]
  votedIds: Set<string>
  isLoggedIn: boolean
  onVote: (setupId: string) => void
  isHistory?: boolean
}) {
  const winner1 = winners.find(w => w.position === 1)
  const winner2 = winners.find(w => w.position === 2)
  const winner3 = winners.find(w => w.position === 3)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 80px' }}>
      {/* Cabecera */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>
          Setup del Mes
        </h2>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {contest.title} · Temática: {contest.theme}
        </div>
        {contest.active && (
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 16px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              En curso
            </span>
          </div>
        )}
      </div>

      {/* Podio — solo si hay ganadores */}
      {(winner1 || winner2 || winner3) && (
        <div style={{ marginBottom: 48 }}>
          {winner1 && (
            <div style={{ marginBottom: 16 }}>
              <WinnerCard winner={winner1} large contestTitle={contest.title} />
            </div>
          )}
          {(winner2 || winner3) && (
            <div style={{ display: 'flex', gap: 16 }}>
              {winner2 && <WinnerCard winner={winner2} contestTitle={contest.title} />}
              {winner3 && <WinnerCard winner={winner3} contestTitle={contest.title} />}
            </div>
          )}
        </div>
      )}

      {/* Candidatos — solo en concurso activo */}
      {contest.active && candidates.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Todos los candidatos
          </h3>
          {!isLoggedIn && (
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
              <a href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>Inicia sesión</a> para votar.
            </p>
          )}
          <div style={{ columns: 4, columnGap: 16 }} className="candidates-grid">
            <style>{`
              @media (max-width: 1200px) { .candidates-grid { columns: 3 !important; } }
              @media (max-width: 860px)  { .candidates-grid { columns: 2 !important; } }
              @media (max-width: 540px)  { .candidates-grid { columns: 1 !important; } }
              @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
            `}</style>
            {candidates.map(s => (
              <CandidateCard
                key={s.id}
                setup={s}
                voted={votedIds.has(s.id)}
                isLoggedIn={isLoggedIn}
                onVote={onVote}
              />
            ))}
          </div>
        </div>
      )}

      {contest.active && candidates.length === 0 && !winner1 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 15 }}>
          Aún no hay setups con la temática <strong style={{ color: 'var(--text-muted)' }}>{contest.theme}</strong> este mes.
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SetupDelMes() {
  const [activeContest, setActiveContest] = useState<Contest | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [candidates, setCandidates] = useState<SetupWithVotes[]>([])
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sessionToken, setSessionToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(null)

  useEffect(() => {
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          setIsLoggedIn(true)
          setSessionToken(data.session.access_token || '')
        }
      })
    })
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!isLoggedIn || !sessionToken) return
    fetch('/api/monthly-votes', { headers: { Authorization: `Bearer ${sessionToken}` } })
      .then(r => r.json())
      .then(({ votedIds: ids }) => setVotedIds(new Set(ids || [])))
      .catch(() => {})
  }, [isLoggedIn, sessionToken])

  async function loadData() {
    setLoading(true)
    const { supabase } = await import('@/lib/supabase')

    // Concurso activo
    const { data: contest } = await supabase
      .from('monthly_contests')
      .select('*')
      .eq('active', true)
      .single()

    if (contest) {
      setActiveContest(contest)

      // Candidatos: setups cuya categoría incluye el theme_tag
      const { data: setups } = await supabase
        .from('setups')
        .select('id, user_name, title, image_url, category')
        .order('created_at', { ascending: false })

      const matching = (setups || []).filter(s =>
        s.category?.toLowerCase().split(',').map((c: string) => c.trim()).includes(contest.theme_tag.toLowerCase())
      )

      // Contar votos de cada candidato
      const withVotes: SetupWithVotes[] = await Promise.all(
        matching.map(async s => {
          const { count } = await supabase
            .from('monthly_votes')
            .select('*', { count: 'exact', head: true })
            .eq('contest_id', contest.id)
            .eq('setup_id', s.id)
          return { ...s, voteCount: count || 0 }
        })
      )
      withVotes.sort((a, b) => b.voteCount - a.voteCount)
      setCandidates(withVotes)
    }

    // Historial: concursos cerrados con sus ganadores
    const { data: pastContests } = await supabase
      .from('monthly_contests')
      .select('*')
      .eq('active', false)
      .order('ends_at', { ascending: false })

    if (pastContests && pastContests.length > 0) {
      const historyEntries: HistoryEntry[] = await Promise.all(
        pastContests.map(async (c: Contest) => {
          const { data: winners } = await supabase
            .from('monthly_winners')
            .select('position, votes, setup_id')
            .eq('contest_id', c.id)
            .order('position', { ascending: true })

          const winnersRaw = await Promise.all(
            (winners || []).map(async (w: { position: number; votes: number; setup_id: string }) => {
              const { data: setup } = await supabase
                .from('setups')
                .select('id, user_name, title, image_url, category')
                .eq('id', w.setup_id)
                .single()
              return { position: w.position as 1 | 2 | 3, votes: w.votes, setup }
            })
          )
          const winnersWithSetup: Winner[] = winnersRaw.filter(w => w.setup !== null) as Winner[]
          return { contest: c, winners: winnersWithSetup }
        })
      )
      setHistory(historyEntries)
    }

    setLoading(false)
  }

  async function handleVote(setupId: string) {
    if (!isLoggedIn) {
      document.dispatchEvent(new CustomEvent('stationly:require-auth'))
      return
    }

    const alreadyVoted = votedIds.has(setupId)
    const action = alreadyVoted ? 'unvote' : 'vote'

    // Optimistic update
    setVotedIds(prev => {
      const next = new Set(prev)
      alreadyVoted ? next.delete(setupId) : next.add(setupId)
      return next
    })
    setCandidates(prev =>
      prev.map(s => s.id === setupId ? { ...s, voteCount: s.voteCount + (alreadyVoted ? -1 : 1) } : s)
        .sort((a, b) => b.voteCount - a.voteCount)
    )

    try {
      await fetch('/api/monthly-votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ setup_id: setupId, action }),
      })
    } catch {
      // Revertir si falla
      setVotedIds(prev => {
        const next = new Set(prev)
        alreadyVoted ? next.add(setupId) : next.delete(setupId)
        return next
      })
      setCandidates(prev =>
        prev.map(s => s.id === setupId ? { ...s, voteCount: s.voteCount + (alreadyVoted ? 1 : -1) } : s)
          .sort((a, b) => b.voteCount - a.voteCount)
      )
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 32px' }}>
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: 14 }}>Cargando...</div>
      </div>
    )
  }

  // Vista de un mes del historial seleccionado
  if (selectedHistory) {
    return (
      <div>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', marginBottom: 16 }}>
          <button
            onClick={() => setSelectedHistory(null)}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', borderRadius: 8, padding: '6px 14px',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            ← Volver al mes actual
          </button>
        </div>
        <ContestView
          contest={selectedHistory.contest}
          winners={selectedHistory.winners}
          candidates={[]}
          votedIds={new Set()}
          isLoggedIn={false}
          onVote={() => {}}
          isHistory
        />
      </div>
    )
  }

  // Sin concurso activo y sin historial
  if (!activeContest && history.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center', gap: 24 }}>
        <div style={{ fontSize: 64 }}>🏆</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Setup del Mes</h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 999, padding: '10px 24px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Próximamente</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 420, lineHeight: 1.6, margin: 0 }}>
          Cada mes elegimos el setup más votado por la comunidad. El ganador se lleva un badge exclusivo y un lugar en el podio de Stationly.
        </p>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>
    )
  }

  // Vista principal
  return (
    <div>
      {/* Concurso activo */}
      {activeContest && (
        <ContestView
          contest={activeContest}
          winners={[]}
          candidates={candidates}
          votedIds={votedIds}
          isLoggedIn={isLoggedIn}
          onVote={handleVote}
        />
      )}

      {/* Historial */}
      {history.length > 0 && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Historial
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {history.map(entry => {
              const w1 = entry.winners.find(w => w.position === 1)
              if (!w1) return null
              return (
                <div
                  key={entry.contest.id}
                  onClick={() => setSelectedHistory(entry)}
                  style={{
                    cursor: 'pointer',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(-3px)'
                    el.style.borderColor = POSITION_COLORS[1].border + '80'
                    el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'none'
                    el.style.borderColor = 'var(--border)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: 'var(--surface3)' }}>
                    {w1.setup.image_url && (
                      <Image src={w1.setup.image_url} alt={w1.setup.title} fill style={{ objectFit: 'cover' }} sizes="220px" />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)' }} />
                    <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                        {entry.contest.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                        {entry.contest.theme}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: getAvatarGradient(w1.setup.user_name),
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 9,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0b',
                    }}>
                      {w1.setup.user_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {w1.setup.user_name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{w1.votes} votos</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
