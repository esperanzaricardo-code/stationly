'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ComponentIndexRow } from '@/app/components/page'
import { makeAmazonLink, makePcComponentesLink, showsPcComponentes } from '@/lib/amazon'

const CATEGORY_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'GPU', label: 'GPU' },
  { key: 'CPU', label: 'CPU' },
  { key: 'RAM', label: 'RAM' },
  { key: 'Placa Base', label: 'Placa Base' },
  { key: 'Almacenamiento', label: 'Almacenamiento' },
  { key: 'Fuente de Alimentación', label: 'Fuente' },
  { key: 'Caja', label: 'Caja' },
  { key: 'Refrigeración', label: 'Refrigeración' },
  { key: 'Monitor', label: 'Monitor' },
  { key: 'Teclado', label: 'Teclado' },
  { key: 'Ratón', label: 'Ratón' },
  { key: 'Audio', label: 'Audio' },
  { key: 'Micrófono', label: 'Micrófono' },
  { key: 'Webcam', label: 'Webcam' },
  { key: 'Silla', label: 'Silla' },
  { key: 'Escritorio', label: 'Escritorio' },
  { key: 'Mousepad', label: 'Mousepad' },
  { key: 'Otros', label: 'Otros' },
]

const CATEGORY_ICONS: Record<string, string> = {
  'GPU': 'GPU', 'CPU': 'CPU', 'RAM': 'RAM', 'Placa Base': 'MB',
  'Almacenamiento': 'SSD', 'Fuente de Alimentación': 'PSU', 'Caja': 'PC',
  'Refrigeración': 'FAN', 'Monitor': 'MON', 'Teclado': 'KB', 'Ratón': 'M',
  'Audio': 'AUD', 'Micrófono': 'MIC', 'Webcam': 'CAM', 'Silla': 'CH',
  'Escritorio': 'DSK', 'Mousepad': 'PAD',
}

function getIcon(category: string | null): string {
  if (!category) return '?'
  return CATEGORY_ICONS[category] || '?'
}

type Props = { 
  components: ComponentIndexRow[]; 
  country?: string 
}

export default function ComponentsList({ components, country }: Props) {
  const [activeCategory, setActiveCategory] = useState('all')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateScrollState() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState)
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const filtered = activeCategory === 'all'
    ? components
    : components.filter(c => (c.category || 'Otros') === activeCategory)

  return (
    <div>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1800, margin: '0 auto', padding: '0 24px 28px' }}>
        <div style={{ position: 'relative' }}>
          <div ref={scrollRef} style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {CATEGORY_FILTERS.map(f => (
              <button key={f.key} onClick={() => setActiveCategory(f.key)} style={{ flexShrink: 0, background: activeCategory === f.key ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface2)', border: `1px solid ${activeCategory === f.key ? 'transparent' : 'var(--border)'}`, color: activeCategory === f.key ? 'var(--accent-fg, #0a0a0b)' : 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: activeCategory === f.key ? 700 : 500, padding: '7px 16px', borderRadius: 50, cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1800, margin: '0 auto', padding: '0 24px 80px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>No hay componentes</h2>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((comp, i) => (
              <Link key={comp.id} href={`/components/${comp.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', textDecoration: 'none', transition: 'border-color 0.15s' }}>
                <div style={{ flexShrink: 0, width: 32, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--setup-accent, var(--accent))' }}>
                  #{i + 1}
                </div>
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {getIcon(comp.category)}
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{comp.display_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{comp.category || 'Sin categoría'} - {comp.setup_count} setup{comp.setup_count !== 1 ? 's' : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                  <a href={makeAmazonLink(comp.display_name, country)} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'var(--accent-fg, #0a0a0b)', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 50, textDecoration: 'none' }}>Amazon →</a>
                  {showsPcComponentes(country) && (
                    <a href={makePcComponentesLink(comp.display_name)} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 50, textDecoration: 'none' }}>PcComponentes →</a>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
