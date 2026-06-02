import { supabase, Setup } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import Nav from '@/components/Nav'
import LandingHero from '@/components/LandingHero'
import Filters from '@/components/Filters'
import Feed from '@/components/Feed'
import UploadModal from '@/components/UploadModal'
import AnimatedBackground from '@/components/AnimatedBackground'

export const revalidate = 0

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

export default async function Home() {
  const [setups, stats] = await Promise.all([getSetups(), getStats()])
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <Nav />
      <LandingHero setupCount={stats.setupCount} totalLikes={stats.totalLikes} />
      <Filters />
      <Feed initialSetups={setups} />
      <UploadModal />
    </ThemeProvider>
  )
}
