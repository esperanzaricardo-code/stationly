'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Enter() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  function handleSubmit() {
    if (password === 'stationly2025') {
      document.cookie = 'stationly_auth=stationly2025; path=/; max-age=604800'
      router.push('/')
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0a0b',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{
        background: '#111114', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, padding: 40, width: '100%', maxWidth: 400,
        textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.5px', marginBottom: 8,
          background: 'linear-gradient(135deg, #fff 30%, #9b7eff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Station<span style={{
            background: 'linear-gradient(135deg, #7c5cfc, #e040fb)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>ly</span>
        </div>
        <p style={{ color: '#7a7a8c', fontSize: 14, marginBottom: 28 }}>
          Acceso privado — introduce la contraseña
        </p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Contraseña"
          style={{
            width: '100%', background: '#18181d',
            border: `1px solid ${error ? 'rgba(255,77,109,0.7)' : 'rgba(255,255,255,0.07)'}`,
            color: '#f0eff5', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
            padding: '12px 16px', borderRadius: 10, outline: 'none',
            marginBottom: 12, transition: 'border-color 0.2s',
          }}
        />
        {error && (
          <p style={{ color: '#ff4d6d', fontSize: 12, marginBottom: 12 }}>
            Contraseña incorrecta
          </p>
        )}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%', background: 'linear-gradient(135deg, #7c5cfc, #e040fb)',
            color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: 15,
            fontWeight: 700, padding: 13, borderRadius: 50, border: 'none',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,92,252,0.35)',
          }}
        >
          Entrar
        </button>
      </div>
    </div>
  )
}
