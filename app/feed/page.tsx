import { supabase, Setup } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'
import FeedTabs from '@/components/FeedTabs'
import UploadModal from '@/components/UploadModal'
import Toast from '@/components/Toast'
import Footer from '@/components/Footer'
import { ComponentIndexRow } from '@/app/components/page'
export const revalidate = 0
export const dynamic = 'force-dynamic'
async function getSetups(): Promise<Setup[]> {
  const { data, error } = await supabase
    .from('setups').select('*')
    .order('created_at', { ascending: false }).limit(100)
  if (error) { console.error(error); return [] }
  return data || []
}
async function getStats() {
  const { count: setupCount } = await supabase
    .from('setups').select('*', { count: 'exact', head: true })
  const { data: likesData } = await supabase.from('setups').select('likes')
  const totalLikes = likesData?.reduce((a, s) => a + (s.likes || 0), 0) || 0
  return { setupCount: setupCount || 0, totalLikes }
}
async function getComponents(): Promise<ComponentIndexRow[]> {
  const { data, error } = await supabase
    .from('component_index')
    .select('id, normalized_name, display_name, category, setup_count')
    .order('setup_count', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}
export default async function FeedPage() {
  const [setups, stats, components] = await Promise.all([getSetups(), getStats(), getComponents()])
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <Nav setupCount={stats.setupCount} totalLikes={stats.totalLikes} />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 24 }}>
        <FeedTabs setups={setups} components={components} />
      </div>
      <UploadModal />
      <Toast />
      <Footer />
    </ThemeProvider>
  )
}
