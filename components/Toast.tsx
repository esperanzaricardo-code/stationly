'use client'
import { useEffect, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export type ToastItem = {
  id: number
  message: string
  type: ToastType
}

type Listener = (toast: Omit<ToastItem, 'id'>) => void
let listener: Listener | null = null
let nextId = 0

export function toast(message: string, type: ToastType = 'info') {
  listener?.({ message, type })
}

export function toastSuccess(message: string) { toast(message, 'success') }
export function toastError(message: string)   { toast(message, 'error') }
export function toastInfo(message: string)    { toast(message, 'info') }

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    '💡',
}

const COLORS: Record<ToastType, { bg: string; border: string; color: string }> = {
  success: { bg: 'rgba(207,250,124,0.1)',  border: 'rgba(207,250,124,0.3)', color: '#CFFA7C' },
  error:   { bg: 'rgba(255,77,109,0.1)',   border: 'rgba(255,77,109,0.3)',  color: '#ff4d6d' },
  info:    { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: 'var(--text-muted)' },
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = nextId++
    setToasts(prev => [...prev, { ...item, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  useEffect(() => {
    listener = addToast
    return () => { listener = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const c = COLORS[t.type]
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--surface)',
            border: `1px solid ${c.border}`,
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-lg)',
            minWidth: 220, maxWidth: 340,
            animation: 'toast-in 0.22s ease',
            pointerEvents: 'auto',
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: c.bg, border: `1px solid ${c.border}`,
              color: c.color, fontSize: 11, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {ICONS[t.type]}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text)',
              fontFamily: 'var(--font-body)', lineHeight: 1.4,
            }}>
              {t.message}
            </span>
          </div>
        )
      })}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
