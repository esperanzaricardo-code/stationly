import { supabase, Setup } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'
import UserProfile from '@/components/UserProfile'
import { notFound } from 'next/navigation'

export const revalidate = 0

async function getUserSetups(username: string): Promise<Setup[]> {
  const { data, error } = await supabase
    .from('setups')
    .select('*')
    .ilike('user_name', username)
    .order('created_at', { ascending: false })
  if (error || !data || data.length === 0) return []
  return data
}

export default async function UserPage({ params }: { params: { username: string } }) {
  const setups = await getUserSetups(params.username)
  if (setups.length === 0) notFound()

  return (
    <ThemeProvider>
      <AnimatedBackground />
      <Nav />
      <UserProfile setups={setups} username={params.username} />
    </ThemeProvider>
  )
}
