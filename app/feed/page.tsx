import { supabase, Setup } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'
import Filters from '@/components/Filters'
import Feed from '@/components/Feed'
import UploadModal from '@/components/UploadModal'
import Toast from '@/components/Toast'
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
export default async function FeedPage() {
  const [setups, stats] = await Promise.all([getSetups(), getStats()])
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <Nav setupCount={stats.setupCount} totalLikes={stats.totalLikes} />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 24 }}>
        <div style={{ maxWidth: 1800, margin: '0 auto', padding: '0 32px 16px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
            letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 4,
          }}>
            Setups de la comunidad
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {stats.setupCount} setups publicados · {stats.totalLikes.toLocaleString()} likes
          </p>
        </div>
        <Filters />
        <Feed initialSetups={setups} />
      </div>
      <UploadModal />
      <Toast />
    </ThemeProvider>
  )
}
