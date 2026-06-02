'use client'
import { useState } from 'react'

export default function Nav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 64,
      background: 'rgba(10,10,11,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
        letterSpacing: '-0.5px',
        background: 'linear-gradient(135deg, #fff 30%, #9b7eff)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Station<span style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>ly</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="nav-pill"
          onClick={() => document.dispatchEvent(new CustomEvent('stationly:open-upload'))}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 13, letterSpacing: '0.3px', padding: '9px 20px',
            borderRadius: 50, border: 'none', cursor: 'pointer',
            boxShadow: '0 0 20px var(--accent-glow)', transition: 'all 0.2s',
          }}
        >
          <span>📸</span> Subir Setup
        </button>
      </div>
    </nav>
  )
}
