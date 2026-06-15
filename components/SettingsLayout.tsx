'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, ACCENT_COLORS, AccentColor } from '@/lib/supabase'
import { toastSuccess, toastError } from './Toast'

const TAGS = ['Gamer', 'Streamer', 'Developer', 'Content Creator']

const TAG_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  'Founder':         { bg: 'rgba(255,200,50,0.15)',  border: 'rgba(255,200,50,0.4)',  color: '#ffc832' },
  'Gamer':           { bg: 'rgba(207,250,124,0.12)', border: 'rgba(207,250,124,0.3)', color: '#b8e86a' },
  'Streamer':        { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)',  color: '#c084fc' },
  'Developer':       { bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.3)',  color: '#38bdf8' },
  'Content Creator': { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.3)',  color: '#fb923c' },
}

function applyAppColor(color: AccentColor) {
  const map: Record<AccentColor, { accent: string; accent2: string; glow: string }> = {
    lime:   { accent: '#CFFA7C', accent2: '#9CE89D', glow: 'rgba(207,250,124,0.25)' },
    blue:   { accent: '#60a5fa', accent2: '#818cf8', glow: 'rgba(96,165,250,0.25)' },
    purple: { accent: '#c084fc', accent2: '#a855f7', glow: 'rgba(192,132,252,0.25)' },
    pink:   { accent: '#f472b6', accent2: '#fb7185', glow: 'rgba(244,114,182,0.25)' },
    orange: { accent: '#fb923c', accent2: '#fbbf24', glow: 'rgba(251,146,60,0.25)' },
    red:    { accent: '#f87171', accent2: '#ef4444', glow: 'rgba(248,113,113,0.25)' },
    cyan:   { accent: '#22d3ee', accent2: '#38bdf8', glow: 'rgba(34,211,238,0.25)' },
    yellow: { accent: '#fde047', accent2: '#facc15', glow: 'rgba(253,224,71,0.25)' },
    mint:   { accent: '#2dd4bf', accent2: '#34d399', glow: 'rgba(45,212,191,0.25)' },
    indigo: { accent: '#818cf8', accent2: '#6366f1', glow: 'rgba(129,140,248,0.25)' },
  }
  const c = map[color] || map.lime
  const root = document.documentElement
  root.style.setProperty('--setup-accent', c.accent)
  root.style.setProperty('--setup-accent2', c.accent2)
  root.style.setProperty('--setup-accent-glow', c.glow)
  root.style.setProperty('--accent', c.accent)
  root.style.setProperty('--accent2', c.accent2)
  root.style.setProperty('--accent-glow', c.glow)
  root.style.setProperty('--tag-bg', `rgba(${c.glow.slice(5, -1).split(',').slice(0,3).join(',')},0.1)`)
  root.style.setProperty('--tag-border', `rgba(${c.glow.slice(5, -1).split(',').slice(0,3).join(',')},0.3)`)
  root.style.setProperty('--tag-text', c.accent)
}

const SECTIONS = [
  { key: 'account', label: 'Cuenta' },
  { key: 'liked', label: 'Setups Likeados' },
  { key: 'affiliates', label: 'Afiliados' },
  { key: 'appearance', label: 'Apariencia' },
  { key: 'privacy', label: 'Privacidad y datos' },
  { key: 'help', label: 'Ayuda y soporte' },
] as const

type SectionKey = typeof SECTIONS[number]['key']

const inputStyle = {
  background: 'var(--surface2)', border: '1px solid var(--border)',
  color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
  padding: '8px 12px', borderRadius: 'var(--radius-sm)', outline: 'none', width: '100%',
}

export default function SettingsLayout() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<SectionKey>('account')
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')

  // Datos del perfil
  const [profileTag, setProfileTag] = useState<string | null>(null)
  const [roleTag, setRoleTag] = useState<string>('')
  const [amazonAffiliateId, setAmazonAffiliateId] = useState('')
  const [showPcComponentes, setShowPcComponentes] = useState(true)
  const [appColor, setAppColor] = useState<AccentColor>('lime')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (!user) {
        router.push('/login')
        return
      }
      const uname = user.user_metadata?.username || user.email?.split('@')[0] || ''
      setUsername(uname)

      supabase.from('profiles')
        .select('tag, role_tag, amazon_affiliate_id, show_pccomponentes, app_accent_color')
        .eq('username', uname).single()
        .then(({ data: profile }) => {
          if (profile?.tag) setProfileTag(profile.tag)
          if (profile?.role_tag) setRoleTag(profile.role_tag)
          if (profile?.amazon_affiliate_id) setAmazonAffiliateId(profile.amazon_affiliate_id)
          if (profile?.show_pccomponentes !== undefined && profile?.show_pccomponentes !== null) setShowPcComponentes(profile.show_pccomponentes)
          if (profile?.app_accent_color) setAppColor(profile.app_accent_color as AccentColor)
          setLoading(false)
        })
    })
  }, [router])

  async function saveProfile(updates: Record<string, unknown>) {
    setSaving(true)
    try {
      await supabase.from('profiles').upsert({ username, ...updates }, { onConflict: 'username' })
      toastSuccess('Cambios guardados')
    } catch {
      toastError('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  async function changeAppColor(color: AccentColor) {
    setAppColor(color)
    applyAppColor(color)
    try { localStorage.setItem('stationly-app-color', color) } catch {}
    await saveProfile({ app_accent_color: color })
  }

  if (loading) {
    return (
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando...
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
        letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 28,
      }}>
        Configuración
      </h1>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }} className="settings-layout">
        <style>{`
          @media (max-width: 760px) {
            .settings-layout { flex-direction: column !important; gap: 16px !important; }
            .settings-sidebar { width: 100% !important; flex-direction: row !important; overflow-x: auto !important; flex-wrap: nowrap !important; }
            .settings-sidebar button { flex-shrink: 0; white-space: nowrap; }
          }
        `}</style>

        {/* Sidebar */}
        <div className="settings-sidebar" style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)} style={{
              textAlign: 'left', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: activeSection === s.key ? 'var(--surface2)' : 'transparent',
              border: activeSection === s.key ? '1px solid var(--border)' : '1px solid transparent',
              color: activeSection === s.key ? 'var(--text)' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: activeSection === s.key ? 700 : 600,
              cursor: 'pointer', transition: 'all 0.18s',
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28 }}>

          {activeSection === 'account' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>Cuenta</h2>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>Nombre de usuario</label>
                <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{username}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Tu tag</label>
                {profileTag === 'Founder' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
                      background: TAG_STYLES['Founder'].bg, border: `1px solid ${TAG_STYLES['Founder'].border}`,
                      color: TAG_STYLES['Founder'].color, padding: '2px 10px', borderRadius: 50,
                      boxShadow: `0 0 8px ${TAG_STYLES['Founder'].border}`, letterSpacing: '0.3px',
                    }}>★ Founder</span>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>El tag Founder no se puede cambiar</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TAGS.map(t => (
                    <button key={t} onClick={() => { setRoleTag(t); saveProfile({ role_tag: t }) }} style={{
                      padding: '6px 14px', borderRadius: 50, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      background: roleTag === t ? TAG_STYLES[t].bg : 'var(--surface2)',
                      border: `1px solid ${roleTag === t ? TAG_STYLES[t].border : 'var(--border)'}`,
                      color: roleTag === t ? TAG_STYLES[t].color : 'var(--text-muted)',
                      transition: 'all 0.18s',
                    }}>{t}</button>
                  ))}
                  {roleTag && (
                    <button onClick={() => { setRoleTag(''); saveProfile({ role_tag: null }) }} style={{ padding: '6px 14px', borderRadius: 50, cursor: 'pointer', fontSize: 12, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>Sin tag</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'liked' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Setups Likeados</h2>
              <div style={{ textAlign: 'center', padding: '50px 24px', background: 'var(--surface2)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-dim)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>♡</div>
                Próximamente: aquí verás todos los setups que has marcado con like.
              </div>
            </div>
          )}

          {activeSection === 'affiliates' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>Afiliados</h2>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>ID de afiliado Amazon</label>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Si tienes cuenta en Amazon Associates, pega aquí tu ID (ej: tunombre-21).</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={amazonAffiliateId} onChange={e => setAmazonAffiliateId(e.target.value)} placeholder="ej: tunombre-21" style={inputStyle} />
                  <button onClick={() => saveProfile({ amazon_affiliate_id: amazonAffiliateId || null })} disabled={saving} className="btn-primary" style={{ fontSize: 13, padding: '0 18px', flexShrink: 0, opacity: saving ? 0.6 : 1 }}>
                    {saving ? '...' : 'Guardar'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>Links de tiendas</label>
                <button onClick={() => { const v = !showPcComponentes; setShowPcComponentes(v); saveProfile({ show_pccomponentes: v }) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                  <div style={{ width: 36, height: 20, borderRadius: 10, transition: 'background 0.2s', background: showPcComponentes ? `linear-gradient(135deg, var(--accent), var(--accent2))` : 'var(--border)', position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: showPcComponentes ? 19 : 3, transition: 'left 0.2s' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Mostrar PcComponentes</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Amazon siempre aparece. PcComponentes es opcional.</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>Apariencia</h2>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Color de la app</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {ACCENT_COLORS.map(color => (
                    <button key={color.id} onClick={() => changeAppColor(color.id)} title={color.label}
                      style={{ width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', border: 'none', background: `linear-gradient(135deg, ${color.from}, ${color.to})`, outline: appColor === color.id ? `3px solid ${color.from}` : '3px solid transparent', outlineOffset: 2, boxShadow: appColor === color.id ? `0 0 10px ${color.from}88` : 'none', transition: 'all 0.18s' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Privacidad y datos</h2>
              <div style={{ textAlign: 'center', padding: '50px 24px', background: 'var(--surface2)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-dim)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                Próximamente: cambiar contraseña, eliminar cuenta y exportar tus datos.
              </div>
            </div>
          )}

          {activeSection === 'help' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Ayuda y soporte</h2>
              <div style={{ textAlign: 'center', padding: '50px 24px', background: 'var(--surface2)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-dim)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                Próximamente: preguntas frecuentes y formas de contacto.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
