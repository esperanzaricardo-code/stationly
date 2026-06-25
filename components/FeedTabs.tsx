'use client';

import { useState } from 'react';
import { Setup } from '@/lib/supabase';
import { ComponentIndexRow } from '@/app/components/page';
import Feed from './Feed';
import Filters from './Filters';
import ComponentsList from './ComponentsList';

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
        <SetupDelMesProximamente />
      )}
    </div>
  );
}

function SetupDelMesProximamente() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 32px',
      textAlign: 'center',
      gap: 24,
    }}>
      <div style={{ fontSize: 64 }}>🏆</div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 32,
        fontWeight: 800,
        color: 'var(--text)',
        margin: 0,
      }}>
        Setup del Mes
      </h2>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 999,
        padding: '10px 24px',
      }}>
        <span style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'inline-block',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Próximamente
        </span>
      </div>
      <p style={{
        color: 'var(--text-muted)',
        fontSize: 15,
        maxWidth: 420,
        lineHeight: 1.6,
        margin: 0,
      }}>
        Cada mes elegimos el setup más votado por la comunidad. El ganador se lleva un badge exclusivo y un lugar en el podio de Stationly.
      </p>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
