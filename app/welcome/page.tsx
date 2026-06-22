'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'

function WelcomeModal({ isFounder, onClose }: { isFounder: boolean; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        background: 'var(--surface)',
        border: `1px solid ${isFounder ? 'rgba(255,200,50,0.4)' : 'var(--border)'}`,
        borderRadius: 24, padding: 36, width: '100%', maxWidth: 400,
        textAlign: 'center',
        boxShadow: isFounder ? '0 0 40px rgba(255,200,50,0.15)' : 'var(--shadow-lg)',
        animation: 'welcome-in 0.3s ease',
      }}>
        {isFounder ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>★</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,200,50,0.15)', border: '1px solid rgba(255,200,50,0.4)', color: '#ffc832', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 50, marginBottom: 20, boxShadow: '0 0 12px rgba(255,200,50,0.3)', letterSpacing: '0.5px' }}>
              ★ Founder
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              Eres uno de los primeros
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 8 }}>
              Formas parte de los <strong style={{ color: 'var(--text)' }}>1.000 primeros usuarios</strong> de Stationly. Como agradecimiento, tu perfil lucirá para siempre el badge exclusivo de <strong style={{ color: '#ffc832' }}>★ Founder</strong>.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 28 }}>
              Gracias por confiar en el proyecto desde el principio. Esto es solo el comienzo.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              ¡Bienvenido a Stationly!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              Ya puedes subir tu setup, añadir componentes con IA y compartir tu página en tu bio de Twitch o YouTube.
            </p>
          </>
        )}
        <button onClick={onClose} className="btn-primary" style={{ width: '100%', fontSize: 14, padding: 13 }}>
          {isFounder ? '★ Empezar como Founder' : 'Empezar →'}
        </button>
      </div>
      <style>{`
        @keyframes welcome-in {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function WelcomePage() {
  const router = useRouter()
  const [modal, setModal] = useState<{ show: boolean; isFounder: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      // Esperar a que Supabase procese el token del hash de la URL
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // No hay sesión — redirigir al login
        router.replace('/login')
        return
      }

      const username = session.user.user_metadata?.username
        || session.user.email?.split('@')[0] || ''
      const sessionToken = session.access_token

      // Comprobar si el profile ya tiene tag asignado
      const { data: profile } = await supabase
        .from('profiles')
        .select('tag')
        .eq('username', username)
        .single()

      if (profile?.tag === 'Founder' || profile?.tag === 'User') {
        // Ya procesado anteriormente — ir al feed directamente
        router.replace('/feed')
        return
      }

      // Primera vez — asignar Founder si es elegible
      let isFounder = false
      try {
        const res = await fetch('/api/founder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, sessionToken }),
        })
        const data = await res.json()
        isFounder = !!data.isFounder
      } catch {}

      setModal({ show: true, isFounder })
      setLoading(false)
    }

    init()
  }, [router])

  function handleClose() {
    setModal(null)
    router.replace('/feed')
  }

  // Aplicar colores lima
  useEffect(() => {
    try {
      const root = document.documentElement
      root.style.setProperty('--accent', '#CFFA7C')
      root.style.setProperty('--accent2', '#9CE89D')
      root.style.setProperty('--accent-glow', 'rgba(207,250,124,0.25)')
      root.style.setProperty('--tag-bg', 'rgba(207,250,124,0.1)')
      root.style.setProperty('--tag-border', 'rgba(207,250,124,0.3)')
      root.style.setProperty('--tag-text', '#CFFA7C')
    } catch {}
  }, [])

  return (
    <ThemeProvider>
      <AnimatedBackground />
      {modal?.show && (
        <WelcomeModal isFounder={modal.isFounder} onClose={handleClose} />
      )}
      {loading && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Preparando tu cuenta...</p>
        </div>
      )}
    </ThemeProvider>
  )
}
