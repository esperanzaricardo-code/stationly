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
  category?: string
  links: ShopLink[]
  confident?: boolean
  did_you_mean?: string
  unknown?: boolean
}

export type Pin = {
  id: number
  x: number
  y: number
  name: string
  links: ShopLink[]
}

export type Setup = {
  id: string
  user_name: string
  title: string
  category: string
  tags: Component[]
  components: Component[]
  pins: Pin[]
  image_url: string | null
  likes: number
  created_at: string
  accent_color: string | null
}

export type AccentColor = 'lime' | 'blue' | 'purple' | 'pink' | 'orange' | 'red' | 'cyan' | 'yellow'

export const ACCENT_COLORS: { id: AccentColor; label: string; from: string; to: string }[] = [
  { id: 'lime',   label: 'Verde',   from: '#CFFA7C', to: '#9CE89D' },
  { id: 'blue',   label: 'Azul',    from: '#60a5fa', to: '#818cf8' },
  { id: 'purple', label: 'Morado',  from: '#c084fc', to: '#a855f7' },
  { id: 'pink',   label: 'Rosa',    from: '#f472b6', to: '#fb7185' },
  { id: 'orange', label: 'Naranja', from: '#fb923c', to: '#fbbf24' },
  { id: 'red',    label: 'Rojo',    from: '#f87171', to: '#ef4444' },
  { id: 'cyan',   label: 'Cian',    from: '#22d3ee', to: '#38bdf8' },
  { id: 'yellow', label: 'Amarillo',from: '#fde047', to: '#facc15' },
]
