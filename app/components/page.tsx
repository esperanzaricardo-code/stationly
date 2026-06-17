import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'
import ComponentsList from '@/components/ComponentsList'
import Footer from '@/components/Footer'
export const revalidate = 0
export const dynamic = 'force-dynamic'
export type ComponentIndexRow = {
  id: string
  normalized_name: string
  display_name: string
  category: string | null
  setup_count: number
}
async function getComponents(): Promise<ComponentIndexRow[]> {
  const { data, error } = await supabase
    .from('component_index')
    .select('id, normalized_name, display_name, category, setup_count')
    .order('setup_count', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}
export default async function ComponentsPage() {
  const components = await getComponents()
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <div style={{ position: 'relative', zIndex: 1, paddingTop: 24, flex: 1 }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 16px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
              letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 4,
            }}>
              Índice de Componentes
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {components.length} componentes y periféricos usados por la comunidad
            </p>
          </div>
          <ComponentsList components={components} />
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
