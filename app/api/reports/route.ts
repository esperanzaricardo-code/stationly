import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return NextResponse.json({ reportedIds: [] })

    const sessionToken = authHeader.replace('Bearer ', '')

    // Verificar sesión
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${sessionToken}` } } }
    )
    const { data: { user }, error } = await authClient.auth.getUser()
    if (error || !user) return NextResponse.json({ reportedIds: [] })

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || ''

    const { data } = await supabaseAdmin
      .from('reports')
      .select('setup_id')
      .eq('user_name', userName)

    const reportedIds = data?.map(r => r.setup_id) || []
    return NextResponse.json({ reportedIds })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ reportedIds: [] })
  }
}
