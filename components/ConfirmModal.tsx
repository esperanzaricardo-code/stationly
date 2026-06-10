'use client'
import { useEffect, useState, useCallback } from 'react'

type ConfirmOptions = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

type ConfirmRequest = ConfirmOptions & {
  resolve: (value: boolean) => void
}

let openConfirm: ((opts: ConfirmOptions) => Promise<boolean>) | null = null

export function confirm(opts: ConfirmOptions): Promise<boolean> {
  return openConfirm ? openConfirm(opts) : Promise.resolve(window.confirm(opts.message))
}

export default function ConfirmModal() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null)

  const handleOpen = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setRequest({ ...opts, resolve })
    })
  }, [])

  useEffect(() => {
    openConfirm = handleOpen
    return () => { openConfirm = null }
  }, [handleOpen])

  function handleConfirm() {
    request?.resolve(true)
    setRequest(null)
  }

  function handleCancel() {
    request?.resolve(false)
    setRequest(null)
  }

  if (!request) return null

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) handleCancel() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 28, width: '100%', maxWidth: 380,
        boxShadow: 'var(--shadow-lg)', animation: 'confirm-in 0.2s ease',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800,
          color: 'var(--text)', marginBottom: 8,
        }}>
          {request.title}
        </h3>
        <p style={{
          fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 24,
        }}>
          {request.message}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCancel}
            className="btn-secondary"
            style={{ flex: 1, fontSize: 13, padding: '11px 0' }}
          >
            {request.cancelLabel || 'Cancelar'}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1, fontSize: 13, fontWeight: 700, padding: '11px 0',
              borderRadius: 50, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              background: request.danger
                ? 'rgba(255,77,109,0.15)'
                : 'linear-gradient(135deg, var(--accent), var(--accent2))',
              color: request.danger ? '#ff4d6d' : '#0a0a0b',
              outline: request.danger ? '1px solid rgba(255,77,109,0.4)' : 'none',
            } as React.CSSProperties}
          >
            {request.confirmLabel || 'Confirmar'}
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
