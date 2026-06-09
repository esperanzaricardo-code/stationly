'use client'
import { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'
import { supabase } from '@/lib/supabase'
import { ACCENT_COLORS, AccentColor } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

function getStoredAppColor(): AccentColor {
  if (typeof window === 'undefined') return 'lime'
  try { return (localStorage.getItem('stationly-app-color') as AccentColor) || 'lime' } catch { return 'lime' }
}

function setStoredAppColor(color: AccentColor) {
  try { localStorage.setItem('stationly-app-color', color) } catch {}
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

export default function Nav({ setupCount, totalLikes }: { setupCount?: number; totalLikes?: number }) {
  const { theme, toggle } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [appColor, setAppColor] = useState<AccentColor>('lime')

  const isProfilePage = pathname?.startsWith('/u/')

  useEffect(() => {
    const stored = getStoredAppColor()
    setAppColor(stored)
    applyAppColor(stored)
  }, [isProfilePage])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (user) {
        setLoggedIn(true)
        const uname = user.user_metadata?.username || user.email?.split('@')[0] || ''
        setUsername(uname)
        supabase.from('profiles').select('app_accent_color').eq('username', uname).single()
          .then(({ data: profile }) => {
            if (profile?.app_accent_color) {
              const color = profile.app_accent_color as AccentColor
              setAppColor(color)
              setStoredAppColor(color)
              if (!isProfilePage) applyAppColor(color)
            }
          })
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      if (user) {
        setLoggedIn(true)
        setUsername(user.user_metadata?.username || user.email?.split('@')[0] || '')
      } else {
        setLoggedIn(false)
        setUsername('')
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [isProfilePage])

  async function changeAppColor(color: AccentColor) {
    setAppColor(color)
    setStoredAppColor(color)
    if (!isProfilePage) applyAppColor(color)
    if (loggedIn && username) {
      await supabase.from('profiles').upsert({ username, app_accent_color: color }, { onConflict: 'username' })
    }
  }

  function handleLogout() {
    setMenuOpen(false)
    setStoredAppColor('lime')
    applyAppColor('lime')
    setAppColor('lime')
    supabase.auth.signOut().then(() => router.push('/'))
  }

  function handleUpload() {
    setMenuOpen(false)
    if (loggedIn) {
      document.dispatchEvent(new CustomEvent('stationly:open-upload'))
    } else {
      router.push('/login')
    }
  }

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
        background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Logo + Beta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href={loggedIn ? '/feed' : '/'} style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px', color: 'var(--text)' }}>
              Station<span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ly</span>
            </span>
          </Link>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--tag-bg)', border: '1px solid var(--tag-border)',
            color: 'var(--tag-text)', fontSize: 10, fontWeight: 700,
            letterSpacing: '1px', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 50, marginTop: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
            Beta
          </div>
        </div>

        {/* Desktop */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Toggle tema — solo no registrados */}
          {!loggedIn && (
            <button onClick={toggle} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', width: 38, height: 38, borderRadius: '50%',
              fontSize: 16, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}

          {/* Botón ajustes — solo registrados */}
          {loggedIn && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setSettingsOpen(o => !o)} title="Ajustes de apariencia" style={{
                background: settingsOpen ? 'var(--surface3)' : 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)', width: 38, height: 38, borderRadius: '50%',
                fontSize: 16, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              }}>
                ⚙️
              </button>

              {settingsOpen && (
                <div style={{
                  position: 'absolute', top: 46, right: 0,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: 20,
                  minWidth: 240, boxShadow: 'var(--shadow-lg)', zIndex: 200,
                }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Tema</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['dark', 'light'] as const).map(t => (
                        <button key={t} onClick={toggle} style={{
                          flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                          background: theme === t ? 'var(--surface3)' : 'var(--surface2)',
                          border: `1px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`,
                          color: theme === t ? 'var(--text)' : 'var(--text-muted)',
                          fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.18s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                          {t === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Color</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {ACCENT_COLORS.map(color => (
                        <button key={color.id} onClick={() => changeAppColor(color.id)} title={color.label}
                          style={{
                            width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', border: 'none',
                            background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                            outline: appColor === color.id ? `3px solid ${color.from}` : '3px solid transparent',
                            outlineOffset: 2,
                            boxShadow: appColor === color.id ? `0 0 10px ${color.from}88` : 'none',
                            transition: 'all 0.18s',
                          }}
                        />
                      ))}
                    </div>
                    {isProfilePage && (
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.5 }}>
                        En perfiles ajenos se muestra el color elegido por su dueño.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {loggedIn ? (
            <>
              <Link href={`/u/${username}`} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 50, padding: '6px 14px 6px 6px',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: `linear-gradient(135deg, var(--accent), var(--accent2))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11,
                  color: '#0a0a0b', flexShrink: 0,
                }}>
                  {username.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                  {username}
                </span>
              </Link>
              <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: 13 }}>
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-secondary" style={{ fontSize: 13 }}>
              Iniciar sesión
            </Link>
          )}

          <button className="btn-primary" onClick={handleUpload} style={{ fontSize: 13, padding: '9px 18px' }}>
            <span>📸</span> Subir Setup
          </button>
        </div>

        {/* Mobile */}
        <div className="nav-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setMenuOpen(o => !o)} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text)', width: 36, height: 36, borderRadius: '50%',
            fontSize: 18, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .nav-desktop { display: none !important; }
            .nav-mobile { display: flex !important; }
          }
        `}</style>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 10,
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>Tema</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['dark', 'light'] as const).map(t => (
                <button key={t} onClick={toggle} style={{
                  flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                  background: theme === t ? 'var(--surface3)' : 'var(--surface2)',
                  border: `1px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`,
                  color: theme === t ? 'var(--text)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  {t === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
                </button>
              ))}
            </div>
          </div>

          {loggedIn && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>Color</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map(color => (
                  <button key={color.id} onClick={() => changeAppColor(color.id)} title={color.label}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', border: 'none',
                      background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                      outline: appColor === color.id ? `3px solid ${color.from}` : '3px solid transparent',
                      outlineOffset: 2,
                      boxShadow: appColor === color.id ? `0 0 10px ${color.from}88` : 'none',
                      transition: 'all 0.18s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {loggedIn ? (
            <>
              <Link href={`/u/${username}`} onClick={() => setMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px',
                textDecoration: 'none',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `linear-gradient(135deg, var(--accent), var(--accent2))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
                  color: '#0a0a0b',
                }}>
                  {username.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                  {username}
                </span>
              </Link>
              <button onClick={handleUpload} className="btn-primary" style={{ fontSize: 14, padding: '12px', width: '100%' }}>
                📸 Subir Setup
              </button>
              <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: 14, padding: '12px', width: '100%' }}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ fontSize: 14, padding: '12px', width: '100%', textAlign: 'center' }}>
                Iniciar sesión
              </Link>
              <button onClick={handleUpload} className="btn-secondary" style={{ fontSize: 14, padding: '12px', width: '100%' }}>
                📸 Subir Setup
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
