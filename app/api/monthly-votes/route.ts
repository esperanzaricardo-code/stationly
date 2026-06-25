import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — obtener votos del usuario en el concurso activo
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ votedIds: [] })

  const token = auth.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return NextResponse.json({ votedIds: [] })

  const { data: contest } = await supabaseAdmin
    .from('monthly_contests')
    .select('id')
    .eq('active', true)
    .single()

  if (!contest) return NextResponse.json({ votedIds: [] })

  const { data: votes } = await supabaseAdmin
    .from('monthly_votes')
    .select('setup_id')
    .eq('contest_id', contest.id)
    .eq('user_id', user.id)

  return NextResponse.json({ votedIds: votes?.map(v => v.setup_id) || [] })
}

// POST — votar o quitar voto
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const token = auth.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { setup_id, action } = await req.json()
  if (!setup_id || !action) return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })

  const { data: contest } = await supabaseAdmin
    .from('monthly_contests')
    .select('id')
    .eq('active', true)
    .single()

  if (!contest) return NextResponse.json({ error: 'No hay concurso activo' }, { status: 404 })

  if (action === 'vote') {
    const { error: insertError } = await supabaseAdmin
      .from('monthly_votes')
      .insert({ contest_id: contest.id, setup_id, user_id: user.id })

    if (insertError) return NextResponse.json({ error: 'Ya has votado este setup' }, { status: 409 })
  } else if (action === 'unvote') {
    await supabaseAdmin
      .from('monthly_votes')
      .delete()
      .eq('contest_id', contest.id)
      .eq('setup_id', setup_id)
      .eq('user_id', user.id)
  }

  // Devolver el conteo actualizado
  const { count } = await supabaseAdmin
    .from('monthly_votes')
    .select('*', { count: 'exact', head: true })
    .eq('contest_id', contest.id)
    .eq('setup_id', setup_id)

  return NextResponse.json({ votes: count || 0 })
}
