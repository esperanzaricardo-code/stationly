'use client'
import { useState } from 'react'

const FILTERS = [
  { key: 'all', label: '✦ Todos' },
  { key: 'gaming', label: '🎮 Gaming' },
  { key: 'streaming', label: '📡 Streaming' },
  { key: 'workstation', label: '💼 Workstation' },
  { key: 'minimal', label: '◻ Minimal' },
  { key: 'rgb', label: '🌈 RGB' },
]

export default function Filters() {
  const [active, setActive] = useState('all')

  function handleFilter(key: string) {
    setActive(key)
    document.dispatchEvent(new CustomEvent('stationly:filter', { detail: key }))
  }

  return (
    <div style={{
      position: 'relative', zIndex: 1,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 32px 28px', maxWidth: 1400, margin: '0 auto',
      overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => handleFilter(f.key)}
          style={{
            flexShrink: 0,
            background: active === f.key ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface2)',
border: `1px solid ${active === f.key ? 'transparent' : 'var(--border)'}`,
color: active === f.key ? 'var(--accent-fg, #0a0a0b)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active === f.key ? 700 : 500,
            padding: '7px 16px', borderRadius: 50, cursor: 'pointer',
            transition: 'all 0.18s', whiteSpace: 'nowrap',
            boxShadow: active === f.key ? `0 2px 12px var(--accent-glow)` : 'none',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
