import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

async function getUserFromToken(sessionToken: string) {
    const client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${sessionToken}` } } }
        )
    const { data: { user }, error } = await client.auth.getUser()
    return error ? null : user
}

export async function POST(req: NextRequest) {
    try {
          const { username, sessionToken } = await req.json()
          if (!username) return NextResponse.json({ isFounder: false })

      // Verificar que quien hace la request es el propio usuario
      if (!sessionToken) return NextResponse.json({ isFounder: false, error: 'No autorizado' }, { status: 401 })
          const user = await getUserFromToken(sessionToken)
          if (!user) return NextResponse.json({ isFounder: false, error: 'Sesion invalida' }, { status: 401 })

      const tokenUsername = user.user_metadata?.username || user.email?.split('@')[0] || ''
          if (tokenUsername.toLowerCase() !== username.toLowerCase()) {
                  return NextResponse.json({ isFounder: false, error: 'No autorizado' }, { status: 403 })
          }

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
