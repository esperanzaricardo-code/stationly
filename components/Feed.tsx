'use client'
import { useEffect, useState } from 'react'
import { Setup } from '@/lib/supabase'
import SetupCard from './SetupCard'

export default function Feed({ initialSetups }: { initialSetups: Setup[] }) {
  const [setups, setSetups] = useState<Setup[]>(initialSetups)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Listen for filter changes
    const onFilter = (e: Event) => setFilter((e as CustomEvent).detail)
    document.addEventListener('stationly:filter', onFilter)

    // Listen for new setup published
    const onNewSetup = (e: Event) => {
      const setup = (e as CustomEvent).detail as Setup
      setSetups(prev => [setup, ...prev])
    }
    document.addEventListener('stationly:new-setup', onNewSetup)

    return () => {
      document.removeEventListener('stationly:filter', onFilter)
      document.removeEventListener('stationly:new-setup', onNewSetup)
    }
  }, [])

  const filtered = filter === 'all' ? setups : setups.filter(s => s.category === filter)

  return (
    <main style={{
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
  )
}
