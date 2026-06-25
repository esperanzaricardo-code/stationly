'use client';

import { useState } from 'react';
import { Setup } from '@/lib/supabase';
import { ComponentIndexRow } from '@/app/components/page';
import Feed from './Feed';
import Filters from './Filters';
import ComponentsList from './ComponentsList';
import SetupDelMes from './SetupDelMes';

type Props = {
  setups: Setup[];
  components: ComponentIndexRow[];
  country?: string;
};

export default function FeedTabs({ setups, components, country }: Props) {
  const [activeTab, setActiveTab] = useState<'setups' | 'components' | 'setup-del-mes'>('setups');

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
          </button>
          <button onClick={() => setActiveTab('components')} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-sm)',
            background: activeTab === 'components' ? 'var(--surface)' : 'transparent',
            border: activeTab === 'components' ? '1px solid var(--border)' : '1px solid transparent',
            color: activeTab === 'components' ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s',
          }}>
            Componentes
          </button>
          <button onClick={() => setActiveTab('setup-del-mes')} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-sm)',
            background: activeTab === 'setup-del-mes' ? 'var(--surface)' : 'transparent',
            border: activeTab === 'setup-del-mes' ? '1px solid var(--border)' : '1px solid transparent',
            color: activeTab === 'setup-del-mes' ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
             Setup del Mes
          </button>
        </div>
      </div>

      {activeTab === 'setups' ? (
        <div>
          <Filters />
          <Feed initialSetups={setups} />
        </div>
      ) : activeTab === 'components' ? (
        <ComponentsList components={components} country={country} />
      ) : (
        <SetupDelMes />
      )}
    </div>
  );
}
