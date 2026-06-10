'use client'
import { useEffect, useState } from 'react'
import { Setup } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import SetupCard from './SetupCard'

function RegisterPromptModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: 'var(--shadow-lg)', animation: 'confirm-in 0.2s ease' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>♥</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          ¿Te gusta este setup?
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 24 }}>
          Crea una cuenta gratis para dar likes y guardar tus setups favoritos.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => router.push('/login?mode=register')} className="btn-primary" style={{ width: '100%', fontSize: 14, padding: 12 }}>
            Crear cuenta gratis
          </button>
          <button onClick={() => router.push('/login')} className="btn-secondary" style={{ width: '100%', fontSize: 14, padding: 12 }}>
            Ya tengo cuenta
          </button>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', padding: 4 }}>
            Ahora no
          </button>
        </div>
        <style>{`
          @keyframes confirm-in {
            from { opacity: 0; transform: scale(0.96); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default function Feed({ initialSetups }: { initialSetups: Setup[] }) {
  const [setups, setSetups] = useState<Setup[]>(initialSetups)
  const [filter, setFilter] = useState('all')
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false)
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const onFilter = (e: Event) => setFilter((e as CustomEvent).detail)
    document.addEventListener('stationly:filter', onFilter)

    const onNewSetup = (e: Event) => {
      const setup = (e as CustomEvent).detail as Setup
      setSetups(prev => [setup, ...prev])
    }
    document.addEventListener('stationly:new-setup', onNewSetup)

    const onRequireAuth = () => setShowRegisterPrompt(true)
    document.addEventListener('stationly:require-auth', onRequireAuth)

    // Cargar setups reportados por el usuario
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data }) => {
        const user = data.session?.user
        if (!user) return
        const uname = user.user_metadata?.username || user.email?.split('@')[0] || ''
        supabase.from('reports')
          .select('setup_id')
          .eq('user_name', uname)
          .then(({ data: reportData }) => {
            if (reportData && reportData.length > 0) {
              setReportedIds(new Set(reportData.map(r => r.setup_id)))
            }
          })
      })
    })

    // Escuchar nuevos reportes desde SetupCard
    const onReported = (e: Event) => {
      const setupId = (e as CustomEvent).detail as string
      setReportedIds(prev => new Set([...prev, setupId]))
    }
    document.addEventListener('stationly:reported', onReported)

    return () => {
      document.removeEventListener('stationly:filter', onFilter)
      document.removeEventListener('stationly:new-setup', onNewSetup)
      document.removeEventListener('stationly:require-auth', onRequireAuth)
      document.removeEventListener('stationly:reported', onReported)
    }
  }, [])

  const filtered = (filter === 'all'
    ? setups
    : setups.filter(s =>
        s.category
          ?.toLowerCase()
          .split(',')
          .map(c => c.trim())
          .includes(filter.toLowerCase())
      )
  ).filter(s => !reportedIds.has(s.id))

  return (
    <>
      {showRegisterPrompt && <RegisterPromptModal onClose={() => setShowRegisterPrompt(false)} />}
      <main
        style={{
          position: 'relative', zIndex: 1,
          columns: 4, columnGap: 16,
          padding: '0 32px 80px', maxWidth: 1400, margin: '0 auto',
        }}
        className="feed"
      >
        <style>{`
          @media (max-width: 1200px) { .feed { columns: 3 !important; } }
          @media (max-width: 860px)  { .feed { columns: 2 !important; } }
          @media (max-width: 540px)  { .feed { columns: 1 !important; padding: 0 16px 60px !important; } }
        `}</style>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 32px', color: 'var(--text-dim)', fontSize: 15, gridColumn: '1/-1' }}>
            No hay setups en esta categoría todavía. ¡Sé el primero! 🚀
          </div>
        )}
        {filtered.map(setup => (
          <SetupCard key={setup.id} setup={setup} />
        ))}
      </main>
    </>
  )
}

function RegisterPromptModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: 'var(--shadow-lg)', animation: 'confirm-in 0.2s ease' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>♥</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          ¿Te gusta este setup?
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 24 }}>
          Crea una cuenta gratis para dar likes y guardar tus setups favoritos.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => router.push('/login?mode=register')} className="btn-primary" style={{ width: '100%', fontSize: 14, padding: 12 }}>
            Crear cuenta gratis
          </button>
          <button onClick={() => router.push('/login')} className="btn-secondary" style={{ width: '100%', fontSize: 14, padding: 12 }}>
            Ya tengo cuenta
          </button>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', padding: 4 }}>
            Ahora no
          </button>
        </div>
        <style>{`
          @keyframes confirm-in {
            from { opacity: 0; transform: scale(0.96); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default function Feed({ initialSetups }: { initialSetups: Setup[] }) {
  const [setups, setSetups] = useState<Setup[]>(initialSetups)
  const [filter, setFilter] = useState('all')
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false)

  useEffect(() => {
    const onFilter = (e: Event) => setFilter((e as CustomEvent).detail)
    document.addEventListener('stationly:filter', onFilter)

    const onNewSetup = (e: Event) => {
      const setup = (e as CustomEvent).detail as Setup
      setSetups(prev => [setup, ...prev])
    }
    document.addEventListener('stationly:new-setup', onNewSetup)

    const onRequireAuth = () => setShowRegisterPrompt(true)
    document.addEventListener('stationly:require-auth', onRequireAuth)

    return () => {
      document.removeEventListener('stationly:filter', onFilter)
      document.removeEventListener('stationly:new-setup', onNewSetup)
      document.removeEventListener('stationly:require-auth', onRequireAuth)
    }
  }, [])

  const filtered = filter === 'all'
    ? setups
    : setups.filter(s =>
        s.category
          ?.toLowerCase()
          .split(',')
          .map(c => c.trim())
          .includes(filter.toLowerCase())
      )

  return (
    <>
      {showRegisterPrompt && <RegisterPromptModal onClose={() => setShowRegisterPrompt(false)} />}
      <main
        style={{
          position: 'relative', zIndex: 1,
          columns: 4, columnGap: 16,
          padding: '0 32px 80px', maxWidth: 1400, margin: '0 auto',
        }}
        className="feed"
      >
        <style>{`
          @media (max-width: 1200px) { .feed { columns: 3 !important; } }
          @media (max-width: 860px)  { .feed { columns: 2 !important; } }
          @media (max-width: 540px)  { .feed { columns: 1 !important; padding: 0 16px 60px !important; } }
        `}</style>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 32px', color: 'var(--text-dim)', fontSize: 15, gridColumn: '1/-1' }}>
            No hay setups en esta categoría todavía. ¡Sé el primero! 🚀
          </div>
        )}
        {filtered.map(setup => (
          <SetupCard key={setup.id} setup={setup} />
        ))}
      </main>
    </>
  )
}
