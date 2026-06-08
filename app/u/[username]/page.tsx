import { supabase, Setup } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'
import UserProfile from '@/components/UserProfile'
import UploadModal from '@/components/UploadModal'

export const revalidate = 0

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
      <Nav />
      <UserProfile setups={setups} username={username} activeSetupId={searchParams.setup} />
      <UploadModal />
    </ThemeProvider>
  )
}
