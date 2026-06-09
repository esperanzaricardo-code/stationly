'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Setup, Component, ShopLink, Pin, AccentColor, ACCENT_COLORS } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import PinEditor from './PinEditor'
import ImageCropper from './ImageCropper'

const TAGS = ['Gamer', 'Streamer', 'Developer', 'Content Creator']

const TAG_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  'Founder':         { bg: 'rgba(255,200,50,0.15)',  border: 'rgba(255,200,50,0.4)',  color: '#ffc832' },
  'Gamer':           { bg: 'rgba(207,250,124,0.12)', border: 'rgba(207,250,124,0.3)', color: '#b8e86a' },
  'Streamer':        { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)',  color: '#c084fc' },
  'Developer':       { bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.3)',  color: '#38bdf8' },
  'Content Creator': { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.3)',  color: '#fb923c' },
}

const STATIONLY_AFFILIATE_ID = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || 'stationly-21'

function hashStr(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function makeDefaultLink(component: string, shop: string, affiliateId?: string) {
  const query = component.trim().replace(/\s+/g, '+')
  if (shop === 'Amazon') {
    const tag = affiliateId || STATIONLY_AFFILIATE_ID
    return `https://www.amazon.es/s?k=${query}&tag=${tag}`
  }
  if (shop === 'PcComponentes') return `https://www.pccomponentes.com/buscar/?query=${query}`
  return ''
}

function generateLinks(name: string, showPcComponentes: boolean, affiliateId?: string): ShopLink[] {
  const links: ShopLink[] = [{ shop: 'Amazon', url: makeDefaultLink(name, 'Amazon', affiliateId) }]
  if (showPcComponentes) links.push({ shop: 'PcComponentes', url: makeDefaultLink(name, 'PcComponentes') })
  return links
}

function totalLikes(setups: Setup[]) {
  return setups.reduce((a, s) => a + (s.likes || 0), 0)
}

function totalComponents(setups: Setup[]) {
  return setups.reduce((a, s) => {
    const pins = (s.pins || []).filter(p => p.name && p.name.trim())
    const components = (s.components || []).filter(c => c.name && c.name.trim())
    return a + pins.length + components.length
  }, 0)
}

function applyAccentColor(color: AccentColor) {
  const colorMap: Record<AccentColor, { accent: string; accent2: string; glow: string }> = {
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
  const c = colorMap[color] || colorMap.lime
  const root = document.documentElement
  root.style.setProperty('--setup-accent', c.accent)
  root.style.setProperty('--setup-accent2', c.accent2)
  root.style.setProperty('--setup-accent-glow', c.glow)
  root.style.setProperty('--accent', c.accent)
  root.style.setProperty('--accent2', c.accent2)
  root.style.setProperty('--accent-glow', c.glow)
  root.style.setProperty('--tag-text', c.accent)
  root.style.setProperty('--tag-bg', `rgba(${c.glow.slice(5, -1).split(',').slice(0,3).join(',')},0.1)`)
  root.style.setProperty('--tag-border', `rgba(${c.glow.slice(5, -1).split(',').slice(0,3).join(',')},0.3)`)
}

function CategoryPill({ type, category }: { type: string; category?: string }) {
  const label = category || (type === 'internal' ? 'Interno' : 'Periférico')
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600,
      background: 'var(--setup-accent-glow)', border: '1px solid var(--setup-accent)',
      color: 'var(--setup-accent)', padding: '2px 8px', borderRadius: 50,
      flexShrink: 0, whiteSpace: 'nowrap', opacity: 0.9,
    }}>
      {label}
    </span>
  )
}

function ProfileTag({ tag }: { tag: string }) {
  const isFounder = tag === 'Founder'
  const style = TAG_STYLES[tag] || TAG_STYLES['Gamer']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700,
      background: isFounder ? style.bg : 'var(--setup-accent-glow)',
      border: `1px solid ${isFounder ? style.border : 'var(--setup-accent)'}`,
      color: isFounder ? style.color : 'var(--setup-accent)',
      padding: '2px 10px', borderRadius: 50, whiteSpace: 'nowrap',
      boxShadow: isFounder ? `0 0 8px ${style.border}` : 'none',
      letterSpacing: '0.3px',
    }}>
      {isFounder && '★ '}{tag}
    </span>
  )
}

function ComponentTabs({ peripherals, internals, showPcComponentes, affiliateId }: {
  peripherals: Component[]; internals: Component[]; showPcComponentes: boolean; affiliateId?: string
}) {
  const [activeTab, setActiveTab] = useState<'peripherals' | 'internals'>(
    peripherals.length > 0 ? 'peripherals' : 'internals'
  )
  const items = activeTab === 'peripherals' ? peripherals : internals
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: 4, width: 'fit-content' }}>
        {peripherals.length > 0 && (
          <button onClick={() => setActiveTab('peripherals')} style={{
            padding: '7px 18px', borderRadius: 'var(--radius-sm)',
            background: activeTab === 'peripherals' ? 'var(--surface)' : 'transparent',
            border: activeTab === 'peripherals' ? '1px solid var(--border)' : '1px solid transparent',
            color: activeTab === 'peripherals' ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s',
          }}>
            Periféricos
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: activeTab === 'peripherals' ? 'var(--setup-accent)' : 'var(--text-dim)' }}>{peripherals.length}</span>
          </button>
        )}
        {internals.length > 0 && (
          <button onClick={() => setActiveTab('internals')} style={{
            padding: '7px 18px', borderRadius: 'var(--radius-sm)',
            background: activeTab === 'internals' ? 'var(--surface)' : 'transparent',
            border: activeTab === 'internals' ? '1px solid var(--border)' : '1px solid transparent',
            color: activeTab === 'internals' ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s',
          }}>
            Internos
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: activeTab === 'internals' ? 'var(--setup-accent)' : 'var(--text-dim)' }}>{internals.length}</span>
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((comp, i) => {
          const links = comp.links?.length > 0
            ? comp.links.filter(l => l.shop !== 'MediaMarkt' && (showPcComponentes || l.shop !== 'PcComponentes'))
            : generateLinks(comp.name, showPcComponentes, affiliateId)
          return (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <CategoryPill type={comp.type} category={comp.category} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{comp.name}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {links.map((link, li) => (
                  <a key={li} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{ background: `linear-gradient(135deg, var(--setup-accent), var(--setup-accent2))`, color: 'var(--setup-accent-fg)', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 50, textDecoration: 'none' }}>
                    {link.shop} →
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type Props = { setups: Setup[]; username: string; activeSetupId?: string }

export default function UserProfile({ setups: initialSetups, username, activeSetupId }: Props) {
  const router = useRouter()
  const [setups, setSetups] = useState(initialSetups)
  const [activeSetup, setActiveSetup] = useState(() => {
    if (!activeSetupId) return 0
    const index = initialSetups.findIndex(s => s.id === activeSetupId)
    return index >= 0 ? index : 0
  })
  const [isOwner, setIsOwner] = useState(false)
  const [sessionToken, setSessionToken] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Modal editar perfil
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  // Datos del perfil
  const [profileTag, setProfileTag] = useState<string | null>(null)
  const [roleTag, setRoleTag] = useState<string | null>(null)
  const [amazonAffiliateId, setAmazonAffiliateId] = useState<string>('')
  const [showPcComponentes, setShowPcComponentes] = useState(true)
  const [appColor, setAppColor] = useState<AccentColor>('lime')

  // Edición del perfil (modal)
  const [editRoleTag, setEditRoleTag] = useState<string>('')
  const [editAmazonAffiliateId, setEditAmazonAffiliateId] = useState<string>('')
  const [editShowPcComponentes, setEditShowPcComponentes] = useState(true)
  const [editAppColor, setEditAppColor] = useState<AccentColor>('lime')

  // Edición del setup
  const [editAccentColor, setEditAccentColor] = useState<AccentColor>('lime')
  const [editTitle, setEditTitle] = useState('')
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [rawImagePreview, setRawImagePreview] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const photoScanRef = useRef<HTMLInputElement>(null)
  const [editComponents, setEditComponents] = useState<Component[]>([])
  const [editPins, setEditPins] = useState<Pin[]>([])
  const [componentText, setComponentText] = useState('')
  const [scanning, setScanning] = useState(false)
  const [photoScanning, setPhotoScanning] = useState(false)
  const [scanResults, setScanResults] = useState<Component[]>([])
  const [scanDone, setScanDone] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')

  const [likes, setLikes] = useState<Record<string, number>>({})
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [likingLoading, setLikingLoading] = useState<Record<string, boolean>>({})
  const [reported, setReported] = useState<Record<string, boolean>>({})
  const [showReport, setShowReport] = useState<Record<string, boolean>>({})

  const setup = setups[activeSetup]
  const currentAccent = (setup?.accent_color || 'lime') as AccentColor

  const PLACEHOLDER_COLORS = [
    ['#1a1a2e','#16213e','#0f3460'],
    ['#0d0d0d','#1a0a2e','#2a0a4e'],
    ['#0a1628','#0e2040','#1a3a6e'],
  ]
  const pc = PLACEHOLDER_COLORS[hashStr(username) % PLACEHOLDER_COLORS.length]

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (user) {
        const uname = user.user_metadata?.username || user.email?.split('@')[0] || ''
        setIsOwner(uname.toLowerCase() === username.toLowerCase())
        setSessionToken(data.session?.access_token || '')
      }
    })
    const initialLikes: Record<string, number> = {}
    initialSetups.forEach(s => { initialLikes[s.id] = s.likes || 0 })
    setLikes(initialLikes)

    const initialAccent = (initialSetups[activeSetup >= 0 ? activeSetup : 0]?.accent_color || 'lime') as AccentColor
    applyAccentColor(initialAccent)

    supabase.from('profiles').select('tag, role_tag, amazon_affiliate_id, show_pccomponentes, app_accent_color').eq('username', username).single()
      .then(({ data }) => {
        if (data?.tag) setProfileTag(data.tag)
        if (data?.role_tag) setRoleTag(data.role_tag)
        if (data?.amazon_affiliate_id) setAmazonAffiliateId(data.amazon_affiliate_id)
        if (data?.show_pccomponentes !== undefined) setShowPcComponentes(data.show_pccomponentes)
        if (data?.app_accent_color) setAppColor(data.app_accent_color as AccentColor)
      })

    const onNewSetup = (e: Event) => {
      const setup = (e as CustomEvent).detail
      setSetups(prev => [setup, ...prev])
    }
    document.addEventListener('stationly:new-setup', onNewSetup)
    return () => document.removeEventListener('stationly:new-setup', onNewSetup)
  }, [username, initialSetups])

  function switchSetup(index: number) {
    setActiveSetup(index)
    setEditing(false)
    const setupId = setups[index].id
    router.replace(`/u/${encodeURIComponent(username)}?setup=${setupId}`, { scroll: false })
    applyAccentColor((setups[index].accent_color || 'lime') as AccentColor)
  }

  function openProfileModal() {
    setEditRoleTag(roleTag || '')
    setEditAmazonAffiliateId(amazonAffiliateId || '')
    setEditShowPcComponentes(showPcComponentes)
    setEditAppColor(appColor)
    setShowProfileModal(true)
  }

  async function saveProfileModal() {
    setSavingProfile(true)
    try {
      await supabase.from('profiles').upsert({
        username,
        tag: profileTag ?? null,
        role_tag: editRoleTag || null,
        amazon_affiliate_id: editAmazonAffiliateId || null,
        show_pccomponentes: editShowPcComponentes,
        app_accent_color: editAppColor,
      }, { onConflict: 'username' })
      setRoleTag(editRoleTag)
      setAmazonAffiliateId(editAmazonAffiliateId)
      setShowPcComponentes(editShowPcComponentes)
      setAppColor(editAppColor)
      try {
        localStorage.setItem('stationly-app-color', editAppColor)
      } catch {}
      setShowProfileModal(false)
    } catch {}
    setSavingProfile(false)
  }

  async function toggleLike(setupId: string) {
    if (likingLoading[setupId]) return
    setLikingLoading(prev => ({ ...prev, [setupId]: true }))
    const newLiked = !liked[setupId]
    setLiked(prev => ({ ...prev, [setupId]: newLiked }))
    setLikes(prev => ({ ...prev, [setupId]: (prev[setupId] || 0) + (newLiked ? 1 : -1) }))
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: setupId, action: newLiked ? 'like' : 'unlike' }),
      })
      const data = await res.json()
      if (data.likes !== undefined) setLikes(prev => ({ ...prev, [setupId]: data.likes }))
    } catch {
      setLiked(prev => ({ ...prev, [setupId]: !newLiked }))
      setLikes(prev => ({ ...prev, [setupId]: (prev[setupId] || 0) + (newLiked ? -1 : 1) }))
    } finally {
      setLikingLoading(prev => ({ ...prev, [setupId]: false }))
    }
  }

  async function handleReport(setupId: string, userName: string) {
    if (reported[setupId]) return
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: setupId, user: userName }),
      })
    } catch {}
    setReported(prev => ({ ...prev, [setupId]: true }))
    setShowReport(prev => ({ ...prev, [setupId]: false }))
  }

  function startEditing() {
    setEditTitle(setup.title)
    setEditComponents(setup.components ? setup.components.map(c => ({ ...c, links: c.links || [] })) : [])
    setEditPins(setup.pins || [])
    setNewImageFile(null)
    setNewImagePreview(null)
    setRawImagePreview(null)
    setShowCropper(false)
    setComponentText('')
    setScanResults([])
    setScanDone(false)
    setShowAdvanced(false)
    setEditAccentColor((setup.accent_color || 'lime') as AccentColor)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setNewImageFile(null)
    setNewImagePreview(null)
    setRawImagePreview(null)
    setShowCropper(false)
    setScanResults([])
    setScanDone(false)
    setShowAdvanced(false)
    setEditingIndex(null)
  }

  function handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) { alert('Máximo 10MB'); return }
    setNewImageFile(file)
    const reader = new FileReader()
    reader.onload = e => { setRawImagePreview(e.target?.result as string); setShowCropper(true) }
    reader.readAsDataURL(file)
  }

  function handleCropDone(dataUrl: string) { setNewImagePreview(dataUrl); setRawImagePreview(null); setShowCropper(false) }
  function handleCropCancel() { setRawImagePreview(null); setNewImageFile(null); setShowCropper(false); if (fileRef.current) fileRef.current.value = '' }

  async function scanComponents() {
    if (!componentText.trim()) return
    setScanning(true); setScanResults([]); setScanDone(false)
    try {
      const res = await fetch('/api/components', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: componentText }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setScanResults(data.components); setScanDone(true)
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error al analizar') }
    finally { setScanning(false) }
  }

  async function scanComponentPhoto(file: File) {
    setPhotoScanning(true)
    try {
      const reader = new FileReader()
      reader.onload = async e => {
        const dataUrl = e.target?.result as string
        const base64 = dataUrl.split(',')[1]
        const mediaType = dataUrl.split(';')[0].split(':')[1]
        const res = await fetch('/api/components', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: base64, mediaType }) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setScanResults(prev => [...prev, ...data.components]); setScanDone(true); setPhotoScanning(false)
      }
      reader.readAsDataURL(file)
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error al identificar'); setPhotoScanning(false) }
  }

  function acceptComponent(comp: Component) {
    const withLinks = { ...comp, links: generateLinks(comp.name, showPcComponentes, amazonAffiliateId), confident: undefined, did_you_mean: undefined, unknown: undefined }
    setEditComponents(prev => [...prev, withLinks]); setScanResults(prev => prev.filter(c => c.name !== comp.name))
  }

  function acceptSuggestion(comp: Component) {
    const name = comp.did_you_mean || comp.name
    const withLinks = { name, type: comp.type, category: comp.category, links: generateLinks(name, showPcComponentes, amazonAffiliateId) }
    setEditComponents(prev => [...prev, withLinks]); setScanResults(prev => prev.filter(c => c.name !== comp.name))
  }

  function rejectComponent(comp: Component) { setScanResults(prev => prev.filter(c => c.name !== comp.name)) }

  function acceptAll() {
    const accepted = scanResults.map(comp => {
      const name = comp.did_you_mean || comp.name
      return { name, type: comp.type, category: comp.category, links: generateLinks(name, showPcComponentes, amazonAffiliateId) }
    })
    setEditComponents(prev => [...prev, ...accepted]); setScanResults([])
  }

  function updateScanResultName(index: number, name: string) { setScanResults(prev => prev.map((c, i) => i === index ? { ...c, name } : c)) }
  function removeComponent(i: number) { setEditComponents(prev => prev.filter((_, j) => j !== i)) }
  function startEditingComponent(i: number, name: string) { setEditingIndex(i); setEditingName(name) }
  function confirmEditingComponent() {
    if (editingIndex === null) return
    setEditComponents(prev => prev.map((c, i) => i === editingIndex ? { ...c, name: editingName, links: generateLinks(editingName, showPcComponentes, amazonAffiliateId) } : c))
    setEditingIndex(null); setEditingName('')
  }

  async function deleteSetup() {
    if (!window.confirm('¿Seguro que quieres eliminar este setup? Esta acción no se puede deshacer.')) return
    setSaving(true)
    try {
      const res = await fetch('/api/setups', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ setupId: setup.id, sessionToken }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const newSetups = setups.filter(s => s.id !== setup.id)
      setSetups(newSetups); setActiveSetup(0); setEditing(false)
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error al eliminar') }
    finally { setSaving(false) }
  }

  async function saveChanges() {
    if (scanResults.length > 0) {
      const confirm = window.confirm(`Tienes ${scanResults.length} componente${scanResults.length !== 1 ? 's' : ''} sin confirmar. ¿Añadirlos todos?`)
      if (confirm) { acceptAll(); return }
    }
    setSaving(true)
    try {
      let image_url = setup.image_url
      if (newImageFile && newImagePreview) {
        const res = await fetch(newImagePreview)
        const blob = await res.blob()
        const ext = newImageFile.name.split('.').pop() || 'jpg'
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const arrayBuffer = await blob.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)
        const { error: uploadError } = await supabase.storage.from('setups').upload(filename, buffer, { contentType: 'image/jpeg', upsert: false })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('setups').getPublicUrl(filename)
          image_url = urlData.publicUrl
        }
      }
      const updates = {
        title: editTitle,
        components: editComponents.filter(c => c.name.trim()),
        pins: editPins.filter(p => p.name.trim()),
        image_url,
        accent_color: editAccentColor,
      }
      const res = await fetch('/api/setups', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ setupId: setup.id, sessionToken, updates }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSetups(prev => prev.map((s, i) => i === activeSetup ? { ...s, ...updates, image_url: image_url ?? s.image_url } : s))
      applyAccentColor(editAccentColor)
      setEditing(false); setNewImageFile(null); setNewImagePreview(null); setRawImagePreview(null); setShowCropper(false); setScanResults([]); setScanDone(false)
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error al guardar') }
    finally { setSaving(false) }
  }

  function copyLink() { navigator.clipboard.writeText(window.location.href); alert('¡Link copiado!') }

  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
    padding: '8px 12px', borderRadius: 'var(--radius-sm)', outline: 'none', width: '100%',
  }

  if (setups.length === 0) {
    return (
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, var(--setup-accent), var(--setup-accent2))`, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0b', border: '3px solid var(--setup-accent)', boxShadow: '0 0 20px var(--setup-accent-glow)' }}>
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 4 }}>{username}</h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>0 Setups · 0 Componentes · 0 Likes</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🖥️</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Aún no hay ningún setup</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Sube tu primer setup y muéstrale al mundo cómo juegas.</p>
          <button className="btn-primary" onClick={() => document.dispatchEvent(new CustomEvent('stationly:open-upload'))} style={{ fontSize: 14, padding: '11px 24px' }}>
            📸 Subir mi primer setup
          </button>
        </div>
      </div>
    )
  }

  const internals = setup.components?.filter(c => c.type === 'internal' && c.name.trim()) || []
  const peripherals = setup.components?.filter(c => c.type === 'peripheral' && c.name.trim()) || []

  return (
    <div data-setup-color={currentAccent} style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* ── Modal Editar Perfil ── */}
      {showProfileModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowProfileModal(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 480, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <button onClick={() => setShowProfileModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>Editar perfil</h2>

            {/* Tag */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Tu tag</label>
              {profileTag === 'Founder' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <ProfileTag tag="Founder" />
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>El tag Founder no se puede cambiar</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TAGS.map(t => (
                  <button key={t} onClick={() => setEditRoleTag(t)} style={{
                    padding: '6px 14px', borderRadius: 50, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: editRoleTag === t ? TAG_STYLES[t].bg : 'var(--surface2)',
                    border: `1px solid ${editRoleTag === t ? TAG_STYLES[t].border : 'var(--border)'}`,
                    color: editRoleTag === t ? TAG_STYLES[t].color : 'var(--text-muted)',
                    transition: 'all 0.18s',
                  }}>{t}</button>
                ))}
                {editRoleTag && (
                  <button onClick={() => setEditRoleTag('')} style={{ padding: '6px 14px', borderRadius: 50, cursor: 'pointer', fontSize: 12, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                    Sin tag
                  </button>
                )}
              </div>
            </div>

            {/* Color de la app */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Color de la app</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map(color => (
                  <button key={color.id} onClick={() => setEditAppColor(color.id)} title={color.label}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', border: 'none',
                      background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                      outline: editAppColor === color.id ? `3px solid ${color.from}` : '3px solid transparent',
                      outlineOffset: 2,
                      boxShadow: editAppColor === color.id ? `0 0 10px ${color.from}88` : 'none',
                      transition: 'all 0.18s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ID afiliado */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>ID de afiliado Amazon</label>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Si tienes cuenta en Amazon Associates, pega aquí tu ID (ej: tunombre-21).</p>
              <input value={editAmazonAffiliateId} onChange={e => setEditAmazonAffiliateId(e.target.value)} placeholder="ej: tunombre-21" style={inputStyle} />
            </div>

            {/* PcComponentes toggle */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>Links de tiendas</label>
              <button onClick={() => setEditShowPcComponentes(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <div style={{ width: 36, height: 20, borderRadius: 10, transition: 'background 0.2s', background: editShowPcComponentes ? `linear-gradient(135deg, var(--setup-accent), var(--setup-accent2))` : 'var(--border)', position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: editShowPcComponentes ? 19 : 3, transition: 'left 0.2s' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Mostrar PcComponentes</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Amazon siempre aparece. PcComponentes es opcional.</div>
                </div>
              </button>
            </div>

            <button onClick={saveProfileModal} disabled={savingProfile} className="btn-primary" style={{ width: '100%', fontSize: 14, padding: 13, opacity: savingProfile ? 0.6 : 1 }}>
              {savingProfile ? '⏳ Guardando...' : '✓ Guardar perfil'}
            </button>
          </div>
        </div>
      )}

      {/* ── Profile header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, var(--setup-accent), var(--setup-accent2))`, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0b', border: '3px solid var(--setup-accent)', boxShadow: '0 0 20px var(--setup-accent-glow)' }}>
          {username.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', margin: 0 }}>{username}</h1>
            {profileTag && <ProfileTag tag={profileTag} />}
            {roleTag && <ProfileTag tag={roleTag} />}
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { num: setups.length, label: setups.length === 1 ? 'Setup' : 'Setups' },
              { num: totalComponents(setups), label: 'Componentes' },
              { num: totalLikes(setups), label: 'Likes' },
            ].map(({ num, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{num}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          {isOwner && !editing && (
            <>
              <button onClick={openProfileModal} className="btn-secondary" style={{ fontSize: 13 }}>👤 Editar perfil</button>
              <button onClick={startEditing} className="btn-secondary" style={{ fontSize: 13 }}>✏️ Editar setup</button>
            </>
          )}
          <button onClick={copyLink} className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>🔗 Copiar link</button>
        </div>
      </div>

      {/* ── Setup tabs ── */}
      {setups.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {setups.map((s, i) => (
            <button key={s.id} onClick={() => switchSetup(i)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 50,
              background: activeSetup === i ? `linear-gradient(135deg, var(--setup-accent), var(--setup-accent2))` : 'var(--surface2)',
              border: activeSetup === i ? 'none' : '1px solid var(--border)',
              color: activeSetup === i ? 'var(--setup-accent-fg)' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.18s',
            } as React.CSSProperties}>
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* ── MODO EDICIÓN SETUP ── */}
      {editing && isOwner && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--setup-accent)', borderRadius: 'var(--radius)', padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>✏️ Editando: {setup.title}</h2>

          {/* Color del setup */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Color del setup</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {ACCENT_COLORS.map(color => (
                <button key={color.id} onClick={() => setEditAccentColor(color.id)} title={color.label}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', border: 'none',
                    background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                    outline: editAccentColor === color.id ? `3px solid ${color.from}` : '3px solid transparent',
                    outlineOffset: 2,
                    boxShadow: editAccentColor === color.id ? `0 0 12px ${color.from}88` : 'none',
                    transition: 'all 0.18s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Título */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>Título del Setup</label>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={inputStyle} />
          </div>

          {/* Foto */}
          <div style={{ marginBottom: 20 }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
            {showCropper && rawImagePreview ? (
              <ImageCropper src={rawImagePreview} onCrop={handleCropDone} onCancel={handleCropCancel} />
            ) : newImagePreview || setup.image_url ? (
              <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <img src={newImagePreview || setup.image_url || ''} alt="Setup" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, padding: '6px 12px', cursor: 'pointer', backdropFilter: 'blur(4px)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  📸 Cambiar foto
                </button>
                {newImagePreview && (
                  <button onClick={() => { setNewImageFile(null); setNewImagePreview(null) }} style={{ position: 'absolute', top: 10, right: 120, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', width: 28, height: 28, borderRadius: '50%', fontSize: 14, cursor: 'pointer' }}>✕</button>
                )}
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{ background: 'var(--surface2)', border: '2px dashed var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '40px', cursor: 'pointer', fontSize: 13, width: '100%', textAlign: 'center' }}>
                📸 Subir foto del setup
              </button>
            )}
          </div>

          {/* Componentes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>🖥️ Añadir Componentes</label>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>Escribe tus componentes como quieras. La IA los identificará y clasificará automáticamente.</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <textarea value={componentText} onChange={e => setComponentText(e.target.value)}
                placeholder="Ej: RTX 4090 monitor LG 27 pulgadas keychron q1 logitech g pro ram 32gb..."
                rows={3} style={{ ...inputStyle, resize: 'vertical', flex: 1 }} />
              <button onClick={scanComponents} disabled={scanning || !componentText.trim()} className="btn-primary"
                style={{ fontSize: 13, padding: '0 16px', opacity: scanning || !componentText.trim() ? 0.5 : 1, flexShrink: 0, alignSelf: 'flex-start', height: 42 }}>
                {scanning ? '⏳' : '✦ Analizar'}
              </button>
            </div>
            <input ref={photoScanRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && scanComponentPhoto(e.target.files[0])} />
            <button onClick={() => photoScanRef.current?.click()} disabled={photoScanning}
              style={{ background: 'transparent', border: '1px dashed var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', cursor: 'pointer', fontSize: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: photoScanning ? 0.5 : 1 }}>
              {photoScanning ? '⏳ Identificando...' : '📷 ¿No sabes el nombre? Haz una foto al componente'}
            </button>

            {scanDone && scanResults.length > 0 && (
              <div style={{ marginTop: 12, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                    ✦ {scanResults.length} componente{scanResults.length !== 1 ? 's' : ''} detectado{scanResults.length !== 1 ? 's' : ''}
                  </div>
                  <button onClick={acceptAll} style={{ background: `linear-gradient(135deg, var(--setup-accent), var(--setup-accent2))`, border: 'none', color: 'var(--setup-accent-fg)', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                    ✓ Aceptar todos
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>✏️ Haz clic en el nombre para editarlo si la IA se ha equivocado</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {scanResults.map((comp, i) => (
                    <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${comp.unknown ? 'rgba(255,77,109,0.3)' : comp.confident === false ? 'rgba(207,250,124,0.3)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: comp.did_you_mean ? 4 : 0 }}>
                            <CategoryPill type={comp.type} category={comp.category} />
                            <input value={comp.name} onChange={e => updateScanResultName(i, e.target.value)}
                              style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed var(--border)', color: comp.unknown ? '#ff4d6d' : 'var(--text)', fontSize: 13, fontWeight: 600, outline: 'none', flex: 1, minWidth: 0, cursor: 'text', fontFamily: 'var(--font-display)', padding: '2px 4px' }} />
                            <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>✏️</span>
                          </div>
                          {comp.did_you_mean && <div style={{ fontSize: 12, color: 'var(--tag-text)', marginTop: 4 }}>💡 ¿Te refieres a: <strong>{comp.did_you_mean}</strong>?</div>}
                          {comp.unknown && <div style={{ fontSize: 11, color: '#ff4d6d', marginTop: 2 }}>⚠️ No reconocido — se añadirá tal como está</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => comp.did_you_mean ? acceptSuggestion(comp) : acceptComponent(comp)}
                            style={{ background: `linear-gradient(135deg, var(--setup-accent), var(--setup-accent2))`, border: 'none', color: 'var(--setup-accent-fg)', fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>✓</button>
                          <button onClick={() => rejectComponent(comp)}
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {scanDone && scanResults.length === 0 && editComponents.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--tag-text)' }}>✓ Todos los componentes añadidos</div>
            )}
          </div>

          {/* Lista componentes */}
          {editComponents.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
                Componentes añadidos ({editComponents.length})
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {editComponents.map((comp, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                    <CategoryPill type={comp.type} category={comp.category} />
                    {editingIndex === i ? (
                      <input value={editingName} onChange={e => setEditingName(e.target.value)}
                        onBlur={confirmEditingComponent}
                        onKeyDown={e => { if (e.key === 'Enter') confirmEditingComponent(); if (e.key === 'Escape') setEditingIndex(null) }}
                        autoFocus style={{ ...inputStyle, flex: 1, padding: '4px 8px' }} />
                    ) : (
                      <span onClick={() => startEditingComponent(i, comp.name)} style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'text' }}>{comp.name}</span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer' }} onClick={() => startEditingComponent(i, comp.name)}>✏️</span>
                    <button onClick={() => removeComponent(i)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pins */}
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => setShowAdvanced(v => !v)}
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', cursor: 'pointer', fontSize: 13, width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>📍 Marcar componentes en la imagen <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>(opcional)</span></span>
              <span>{showAdvanced ? '▲' : '▼'}</span>
            </button>
            {showAdvanced && (newImagePreview || setup.image_url) && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>Toca la imagen para marcar un componente.</p>
                <PinEditor imageUrl={newImagePreview || setup.image_url || ''} pins={editPins} isOwner={isOwner} editing={true} components={editComponents} onChange={setEditPins} />
              </div>
            )}
          </div>

          {/* Guardar / Cancelar / Eliminar */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={saveChanges} disabled={saving} className="btn-primary" style={{ flex: 1, fontSize: 14, padding: 13, opacity: saving ? 0.6 : 1 }}>
              {saving ? '⏳ Guardando...' : '✓ Guardar cambios'}
            </button>
            <button onClick={cancelEditing} className="btn-secondary" style={{ fontSize: 14, padding: '13px 20px' }}>Cancelar</button>
            <button onClick={deleteSetup} disabled={saving} style={{ fontSize: 14, padding: '13px 20px', background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', color: '#ff4d6d', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: saving ? 0.6 : 1 }}>
              🗑 Eliminar
            </button>
          </div>
        </div>
      )}

      {/* ── Setup image con pins ── */}
      {!editing && (
        <div style={{ marginBottom: 28 }}>
          {setup.image_url ? (
            <PinEditor imageUrl={setup.image_url} pins={setup.pins || []} isOwner={isOwner} editing={false} onChange={setEditPins} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 'var(--radius)', background: `linear-gradient(135deg, ${pc[0]}, ${pc[1]}, ${pc[2]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, border: '1px solid var(--border)' }}>
              🖥️
            </div>
          )}
          {setup.image_url && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>{setup.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{setup.category} · {(setup.pins?.filter(p => p.name).length || 0) + (setup.components?.length || 0)} componentes</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!isOwner && (
                  <div style={{ position: 'relative' }}>
                    {!showReport[setup.id] ? (
                      <button onClick={() => setShowReport(prev => ({ ...prev, [setup.id]: true }))}
                        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: 36, height: 36, borderRadius: '50%', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚑</button>
                    ) : (
                      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'var(--text)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140, position: 'absolute', right: 0, top: 40, zIndex: 10 }}>
                        <span style={{ fontWeight: 600, fontSize: 11, color: 'var(--text-muted)' }}>{reported[setup.id] ? '✓ Reportado' : '¿Reportar este setup?'}</span>
                        {!reported[setup.id] && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleReport(setup.id, setup.user_name)} style={{ flex: 1, background: 'rgba(255,77,109,0.15)', border: '1px solid rgba(255,77,109,0.3)', color: '#ff4d6d', fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>Reportar</button>
                            <button onClick={() => setShowReport(prev => ({ ...prev, [setup.id]: false }))} style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => toggleLike(setup.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: liked[setup.id] ? 'rgba(255,77,109,0.1)' : 'var(--surface2)', border: `1px solid ${liked[setup.id] ? 'rgba(255,77,109,0.5)' : 'var(--border)'}`, color: liked[setup.id] ? '#ff4d6d' : 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 50, cursor: 'pointer', transition: 'all 0.18s' }}>
                  <span style={{ fontSize: 14, transition: 'transform 0.2s', transform: liked[setup.id] ? 'scale(1.25)' : 'scale(1)' }}>{liked[setup.id] ? '♥' : '♡'}</span>
                  {likes[setup.id] || 0}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tabs Periféricos / Internos ── */}
      {!editing && (peripherals.length > 0 || internals.length > 0) && (
        <ComponentTabs peripherals={peripherals} internals={internals} showPcComponentes={showPcComponentes} affiliateId={amazonAffiliateId} />
      )}

      <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 16, lineHeight: 1.5 }}>
        Los links llevan a tiendas externas. Si compras a través de ellos podemos recibir una pequeña comisión sin coste adicional para ti.
      </p>
    </div>
  )
}
