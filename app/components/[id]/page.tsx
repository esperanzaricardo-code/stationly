import { supabase, Setup } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'
import ComponentDetail from '@/components/ComponentDetail'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'
export const revalidate = 0
export const dynamic = 'force-dynamic'
async function getComponent(id: string) {
  const { data, error } = await supabase
    .from('component_index')
    .select('id, normalized_name, display_name, category, setup_count')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data
}
async function getSetupsUsingComponent(normalizedName: string): Promise<Setup[]> {
  const { data, error } = await supabase
    .from('setups')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error || !data) return []
  // Filtramos en código: setups cuyo array "components" contiene
  // un componente cuyo nombre normalizado coincide
  return data.filter((setup: Setup) => {
    const components = setup.components || []
    return components.some(c =>
      c.name && c.name.trim().toLowerCase().replace(/\s+/g, ' ') === normalizedName
    )
  })
}
export default async function ComponentDetailPage({ params }: { params: { id: string } }) {
  const component = await getComponent(params.id)
  if (!component) notFound()
  const setups = await getSetupsUsingComponent(component.normalized_name)
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <Nav />
      <ComponentDetail component={component} setups={setups} />
      <Footer />
    </ThemeProvider>
  )
}
