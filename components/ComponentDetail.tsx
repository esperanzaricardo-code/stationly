import Link from 'next/link'
import { Setup } from '@/lib/supabase'
import SetupCard from './SetupCard'

const STATIONLY_AFFILIATE_ID = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || 'stationly-21'

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

type ComponentInfo = {
  id: string
  normalized_name: string
  display_name: string
  category: string | null
  setup_count: number
}

export default function ComponentDetail({ component, setups }: { component: ComponentInfo; setups: Setup[] }) {
  return (
    <div style={{ position: 'relative', zIndex: 1, paddingTop: 24 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 16px' }}>
        <Link href="/components" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 16,
        }}>
          ← Volver al índice
        </Link>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 28,
        }}>
          <div style={{
            flexShrink: 0, width: 56, height: 56, borderRadius: 'var(--radius-sm)',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            {getIcon(component.category)}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
              letterSpacing: '-0.3px', color: 'var(--text)', marginBottom: 4,
            }}>
              {component.display_name}
            </h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {component.category || 'Sin categoría'} · usado en {component.setup_count} setup{component.setup_count !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            
              href={makeAmazonLink(component.display_name)}
              target="_blank" rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                color: 'var(--accent-fg, #0a0a0b)', fontSize: 13, fontWeight: 700,
                padding: '9px 18px', borderRadius: 50, textDecoration: 'none',
              }}
            >
              Amazon →
            </a>
            
              href={makePcComponentesLink(component.display_name)}
              target="_blank" rel="noopener noreferrer"
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', fontSize: 13, fontWeight: 700,
                padding: '9px 18px', borderRadius: 50, textDecoration: 'none',
              }}
            >
              PcComponentes →
            </a>
          </div>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800,
          color: 'var(--text)', marginBottom: 16,
        }}>
          Setups que lo usan
        </h2>
      </div>

      {setups.length === 0 ? (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 80px' }}>
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-dim)' }}>
            No hay setups públicos que usen este componente todavía.
          </div>
        </div>
      ) : (
        <main
          style={{
            position: 'relative', zIndex: 1,
            columns: 4, columnGap: 16,
            padding: '0 32px 80px',
            maxWidth: 1400, margin: '0 auto',
            width: '100%', boxSizing: 'border-box',
          }}
          className="component-detail-feed"
        >
          <style>{`
            @media (max-width: 1200px) { .component-detail-feed { columns: 3 !important; } }
            @media (max-width: 860px)  { .component-detail-feed { columns: 2 !important; } }
            @media (max-width: 540px)  { .component-detail-feed { columns: 1 !important; padding: 0 16px 60px !important; } }
          `}</style>
          {setups.map(setup => (
            <SetupCard key={setup.id} setup={setup} />
          ))}
        </main>
      )}

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 40px' }}>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Los links llevan a tiendas externas. Si compras a través de ellos podemos recibir una pequeña comisión sin coste adicional para ti.
        </p>
      </div>
    </div>
  )
}
