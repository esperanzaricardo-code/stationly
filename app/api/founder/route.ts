import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json()
    if (!username) return NextResponse.json({ isFounder: false })

    const { data, error } = await supabaseAdmin.rpc('assign_founder_if_eligible', {
      p_username: username,
    })

    if (error) {
      console.error('Founder RPC error:', error)
      return NextResponse.json({ isFounder: false })
    }

    return NextResponse.json({ isFounder: !!data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ isFounder: false })
  }
}
