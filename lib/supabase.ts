import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ShopLink = {
  shop: 'Amazon' | 'PcComponentes' | 'MediaMarkt' | 'Otro'
  url: string
}

export type Component = {
  name: string
  type: 'peripheral' | 'internal'
  links: ShopLink[]
}

export type Setup = {
  id: string
  user_name: string
  title: string
  category: string
  tags: Component[]
  components: Component[]
  image_url: string | null
  likes: number
  created_at: string
}
