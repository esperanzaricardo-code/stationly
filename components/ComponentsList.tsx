'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ComponentIndexRow } from '@/app/components/page'

const STATIONLY_AFFILIATE_ID = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || 'stationly-21'

// -- Categorías disponibles para filtrar --
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

function makeAmazonLink(name: string, country?: string): string {
  const query = name.trim().replace(/\s+/g, '+')
  let domain = 'es'
  if (country === 'US') domain = 'com'
  else if (country === 'MX') domain = 'com.mx'
  else if (country === 'GB' || country === 'UK') domain = 'co.uk'
  else if (country === 'FR') domain = 'fr'
  else if (country === 'IT') domain = 'it'
  else if (country === 'DE') domain = 'de'
  return `https://www.amazon.${domain}/s?k=${query}&tag=${STATIONLY_AFFILIATE_ID}`
}

function makePcComponentesLink(name: string): string {
  const query = name.trim().replace(/\s+/g, '+')
  return `https://www.pccomponentes.com/buscar/?query=${query}`
}

// Actualización: Definimos el tipo para incluir country
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
      {/* ... (el resto de tu estructura de filtros permanece igual) ... */}
      
      {/* Listado */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1800, margin: '0 auto', padding: '0 24px 80px' }}>
        {filtered.length === 0 ? (
           /* ... tu mensaje de no resultados ... */
           null
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((comp, i) => (
              <Link key={comp.id} href={`/components/${comp.id}`} style={{ /* ... tus estilos ... */ }}>
                {/* ... (posición, icono, nombre) ... */}
                
                {/* Links de compra actualizados */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                  <a href={makeAmazonLink(comp.display_name, country)} target="_blank" rel="noopener noreferrer"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'var(--accent-fg, #0a0a0b)', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 50, textDecoration: 'none' }}>
                    Amazon →
                  </a>
                  {(!country || country === 'ES') && (
                    <a href={makePcComponentesLink(comp.display_name)} target="_blank" rel="noopener noreferrer"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 50, textDecoration: 'none' }}>
                      PcComponentes →
                    </a>
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
