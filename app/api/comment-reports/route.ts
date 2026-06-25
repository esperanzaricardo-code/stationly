import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const token = auth.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { comment_id, reason } = await req.json()
  if (!comment_id || !reason) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('comment_reports')
    .insert({ comment_id, user_id: user.id, reason })

  if (error?.code === '23505') return NextResponse.json({ error: 'Ya reportado' }, { status: 409 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
