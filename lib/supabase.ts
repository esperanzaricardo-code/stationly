import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Setup = {
  id: string
  user_name: string
  title: string
  category: string
  tags: string[]
  image_url: string | null
  likes: number
  created_at: string
}
