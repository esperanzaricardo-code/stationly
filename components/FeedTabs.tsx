'use client'
import { useState } from 'react'
import { Setup } from '@/lib/supabase'
import { ComponentIndexRow } from '@/app/components/page'
import Feed from './Feed'
import Filters from './Filters'
import ComponentsList from './ComponentsList'

type Props = {
  setups: Setup[]
  components: ComponentIndexRow[]
}

export default function FeedTabs({ setups, components }: Props) {
  const [activeTab, setActiveTab] = useState<'setups' | 'components'>('setups')

  return (
    <div>
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', gap: 2, marginBottom: 16,
        padding: '0 32px',
        maxWidth: 1800, margin: '0 auto 16px',
        background: 'transparent',
      }}>
        <div style={{ display: 'flex', gap: 2, background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: 4, width: 'fit-content' }}>
          <button onClick={() => setActiveTab('setups')} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-sm)',
            background: activeTab === 'setups' ? 'var(--surface)' : 'transparent',
            border: activeTab === 'setups' ? '1px solid var(--border)' : '1px solid transparent',
            color: activeTab === 'setups' ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s',
          }}>
            Setups
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: activeTab === 'setups' ? 'var(--setup-accent, var(--accent))' : 'var(--text-dim)' }}>{setups.length}</span>
          </button>
          <button onClick={() => setActiveTab('components')} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-sm)',
            background: activeTab === 'components' ? 'var(--surface)' : 'transparent',
            border: activeTab === 'components' ? '1px solid var(--border)' : '1px solid transparent',
            color: activeTab === 'components' ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s',
          }}>
            Componentes
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: activeTab === 'components' ? 'var(--setup-accent, var(--accent))' : 'var(--text-dim)' }}>{components.length}</span>
          </button>
        </div>
      </div>

      {activeTab === 'setups' ? (
        <div>
          <Filters />
          <Feed initialSetups={setups} />
        </div>
      ) : (
        <ComponentsList components={components} />
      )}
    </div>
  )
}
