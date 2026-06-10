'use client'
import { useState } from 'react'

export const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Contenido inapropiado' },
  { id: 'spam',          label: 'Spam o publicidad' },
  { id: 'plagiarism',    label: 'Plagio o contenido robado' },
  { id: 'misleading',    label: 'Información engañosa' },
  { id: 'other',         label: 'Otro motivo' },
]

type Props = {
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export default function ReportModal({ onConfirm, onCancel }: Props) {
  const [selected, setSelected] = useState('')
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 360, boxShadow: 'var(--shadow-lg)', animation: 'confirm-in 0.2s ease' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
          Reportar setup
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          ¿Por qué quieres reportar este setup? No se lo diremos al autor.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {REPORT_REASONS.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              style={{
                textAlign: 'left', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: selected === r.id ? 'rgba(255,77,109,0.1)' : 'var(--surface2)',
                border: `1px solid ${selected === r.id ? 'rgba(255,77,109,0.4)' : 'var(--border)'}`,
                color: selected === r.id ? '#ff4d6d' : 'var(--text)',
                fontSize: 13, fontWeight: selected === r.id ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font-body)',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} className="btn-secondary" style={{ flex: 1, fontSize: 13, padding: '11px 0' }}>
            Cancelar
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            style={{
              flex: 1, fontSize: 13, fontWeight: 700, padding: '11px 0',
              borderRadius: 50, border: 'none', cursor: selected ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-body)',
              background: selected ? 'rgba(255,77,109,0.15)' : 'var(--surface2)',
              color: selected ? '#ff4d6d' : 'var(--text-dim)',
              outline: selected ? '1px solid rgba(255,77,109,0.4)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            Reportar
          </button>
        </div>
      </div>
      <style>{`
        @keyframes confirm-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
