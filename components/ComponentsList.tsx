'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ComponentIndexRow } from '@/app/components/page'

const STATIONLY_AFFILIATE_ID = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || 'stationly-21'

// ── Categorías disponibles para filtrar ──
const CATEGORY_FILTERS = [
  { key: 'all', label: '✦ Todos' },
  { key: 'GPU', label: '🎮 GPU' },
  { key: 'CPU', label: '🧠 CPU' },
  { key: 'RAM', label: '🧩 RAM' },
  { key: 'Placa Base', label: '🔌 Placa Base' },
  { key: 'Almacenamiento', label: '💾 Almacenamiento' },
  { key: 'Fuente de Alimentación', label: '⚡ Fuente' },
  { key: 'Caja', label: '🖥️ Caja' },
  { key: 'Refrigeración', label: '❄️ Refrigeración' },
  { key: 'Monitor', label: '🖼️ Monitor' },
  { key: 'Teclado', label: '⌨️ Teclado' },
  { key: 'Ratón', label: '🖱️ Ratón' },
  { key: 'Audio', label: '🎧 Audio' },
  { key: 'Micrófono', label: '🎙️ Micrófono' },
  { key: 'Webcam', label: '📷 Webcam' },
  { key: 'Silla', label: '💺 Silla' },
  { key: 'Escritorio', label: '🛠️ Escritorio' },
  { key: 'Mousepad', label: '🟪 Mousepad' },
  { key: 'Otros', label: '❔ Otros' },
]

// ── Icono por categoría para la foto pequeña ──
const CATEGORY_ICONS: Record<string, string> = {
  'GPU': '🎮',
  'CPU': '🧠',
  'RAM': '🧩',
  'Placa Base': '🔌',
  'Almacenamiento': '💾',
  'Fuente de Alimentación': '⚡',
  'Caja': '🖥️',
  'Refrigeración': '❄️',
  'Monitor': '🖼️',
  'Teclado': '⌨️',
  'Ratón': '🖱️',
  'Audio': '🎧',
  'Micrófono': '🎙️',
  'Webcam': '📷',
  'Silla': '💺',
  'Escritorio': '🛠️',
  'Mousepad': '🟪',
}

function getIcon(category: string | null): string {
  if (!category) return '❔'
  return CATEGORY_ICONS[category] || '❔'
}

function makeAmazonLink(name: string): string {
  const query = name.trim().replace(/\s+/g, '+')
  return `https://www.amazon.es/s?k=${query}&tag=${STATIONLY_AFFILIATE_ID}`
}

function makePcComponentesLink(name: string): string {
  const query = name.trim().replace(/\s+/g, '+')
  return `https://www.pccomponentes.com/buscar/?query=${query}`
}

export default function ComponentsList({ components }: { components: ComponentIndexRow[] }) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? components
    : components.filter(c => (c.category || 'Otros') === activeCategory)

  return (
    <>
      {/* ── Filtros por categoría ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 24px 28px', maxWidth: 900, margin: '0 auto',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {CATEGORY_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveCategory(f.key)}
            style={{
              flexShrink: 0,
              background: activeCategory === f.key ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface2)',
              border: `1px solid ${activeCategory === f.key ? 'transparent' : 'var(--border)'}`,
              color: activeCategory === f.key ? 'var(--accent-fg, #0a0a0b)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: activeCategory === f.key ? 700 : 500,
              padding: '7px 16px', borderRadius: 50, cursor: 'pointer',
              transition: 'all 0.18s', whiteSpace: 'nowrap',
              boxShadow: activeCategory === f.key ? `0 2px 12px var(--accent-glow)` : 'none',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Listado ── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
              No hay componentes en esta categoría
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Prueba con otro filtro o vuelve más tarde.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((comp, i) => (
              <Link
                key={comp.id}
                href={`/components/${comp.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '14px 18px',
                  textDecoration: 'none', transition: 'border-color 0.15s',
                }}
              >
                {/* Posición */}
                <div style={{
                  flexShrink: 0, width: 32, textAlign: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800,
                  color: 'var(--setup-accent, var(--accent))',
                }}>
                  #{i + 1}
                </div>

                {/* Icono / foto pequeña */}
                <div style={{
                  flexShrink: 0, width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {getIcon(comp.category)}
                </div>

                {/* Nombre + setup count */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    {comp.display_name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {comp.category || 'Sin categoría'} · {comp.setup_count} setup{comp.setup_count !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Links de compra */}
                <div
                  style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}
                  onClick={e => e.stopPropagation()}
                >
                  
                    href={makeAmazonLink(comp.display_name)}
                    target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                      color: 'var(--accent-fg, #0a0a0b)', fontSize: 11, fontWeight: 700,
                      padding: '5px 12px', borderRadius: 50, textDecoration: 'none',
                    }}
                  >
                    Amazon →
                  </a>
                  
                    href={makePcComponentesLink(comp.display_name)}
                    target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      color: 'var(--text-muted)', fontSize: 11, fontWeight: 700,
                      padding: '5px 12px', borderRadius: 50, textDecoration: 'none',
                    }}
                  >
                    PcComponentes →
                  </a>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 20, lineHeight: 1.5 }}>
          Los links llevan a tiendas externas. Si compras a través de ellos podemos recibir una pequeña comisión sin coste adicional para ti.
        </p>
      </div>
    </>
  )
}
