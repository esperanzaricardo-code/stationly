import { supabase, Setup } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'
import UserProfile from '@/components/UserProfile'
import UploadModal from '@/components/UploadModal'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import Footer from '@/components/Footer'
export const revalidate = 0
export const dynamic = 'force-dynamic'
async function getUserSetups(username: string): Promise<Setup[]> {
  const decoded = decodeURIComponent(username)
  const { data, error } = await supabase
    .from('setups')
    .select('*')
    .ilike('user_name', decoded)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data
}
export default async function UserPage({
  params,
  searchParams,
}: {
  params: { username: string }
  searchParams: { setup?: string }
}) {
  const username = decodeURIComponent(params.username)
  const setups = await getUserSetups(params.username)
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <div style={{ flex: 1 }}>
          <UserProfile setups={setups} username={username} activeSetupId={searchParams.setup} />
        </div>
        <Footer />
      </div>
      <UploadModal />
      <Toast />
      <ConfirmModal />
    </ThemeProvider>
  )
}
