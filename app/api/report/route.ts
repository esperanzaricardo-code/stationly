import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { id, sessionToken, reason } = await req.json()

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    if (!sessionToken) return NextResponse.json({ error: 'Debes iniciar sesión para reportar' }, { status: 401 })
    if (!reason) return NextResponse.json({ error: 'Selecciona un motivo' }, { status: 400 })

    // Verificar sesión
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${sessionToken}` } } }
    )
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'unknown'

    // Verificar que no es su propio setup
    const { data: setup } = await supabaseAdmin
      .from('setups').select('user_name').eq('id', id).single()
    if (setup?.user_name?.toLowerCase() === userName.toLowerCase()) {
      return NextResponse.json({ error: 'No puedes reportar tu propio setup' }, { status: 403 })
    }

    // Verificar que no ha reportado ya este setup
    const { data: existing } = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('setup_id', id)
      .eq('user_name', userName)
      .single()
    if (existing) return NextResponse.json({ ok: true, alreadyReported: true })

    // Insertar reporte
    await supabaseAdmin.from('reports').insert([{
      setup_id: id,
      user_name: userName,
      reason,
      created_at: new Date().toISOString(),
    }])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
