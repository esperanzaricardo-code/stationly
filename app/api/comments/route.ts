import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — obtener comentarios de un setup
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const setupId = searchParams.get('setup_id')
  if (!setupId) return NextResponse.json({ error: 'Falta setup_id' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*')
    .eq('setup_id', setupId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comments: data || [] })
}

// POST — crear comentario
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const token = auth.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { setup_id, body, parent_id, component_name } = await req.json()
  if (!setup_id || !body?.trim()) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  if (body.length > 500) return NextResponse.json({ error: 'Máximo 500 caracteres' }, { status: 400 })

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'usuario'

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({ setup_id, user_id: user.id, username, body: body.trim(), parent_id: parent_id || null, component_name: component_name || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data })
}

// DELETE — borrar comentario (autor o dueño del setup)
export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const token = auth.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { comment_id, setup_owner_username } = await req.json()
  if (!comment_id) return NextResponse.json({ error: 'Falta comment_id' }, { status: 400 })

  const username = user.user_metadata?.username || user.email?.split('@')[0] || ''
  const isSetupOwner = username.toLowerCase() === setup_owner_username?.toLowerCase()

  const { data: comment } = await supabaseAdmin
    .from('comments')
    .select('user_id')
    .eq('id', comment_id)
    .single()

  if (!comment) return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
  if (comment.user_id !== user.id && !isSetupOwner) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  await supabaseAdmin.from('comments').delete().eq('id', comment_id)
  return NextResponse.json({ ok: true })
}

// PATCH — pinar/despinar (solo dueño del setup)
export async function PATCH(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const token = auth.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { comment_id, pinned, setup_id } = await req.json()

  // Verificar que es el dueño del setup
  const { data: setup } = await supabaseAdmin
    .from('setups')
    .select('user_name')
    .eq('id', setup_id)
    .single()

  const username = user.user_metadata?.username || user.email?.split('@')[0] || ''
  if (!setup || setup.user_name.toLowerCase() !== username.toLowerCase()) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  // Solo puede haber un comentario pinado por setup
  if (pinned) {
    await supabaseAdmin.from('comments').update({ pinned: false }).eq('setup_id', setup_id)
  }

  await supabaseAdmin.from('comments').update({ pinned }).eq('id', comment_id)
  return NextResponse.json({ ok: true })
}
