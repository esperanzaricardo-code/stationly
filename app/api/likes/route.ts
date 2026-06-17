import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente admin — la tabla setup_likes no tiene políticas públicas,
// así que solo se puede leer/escribir con la clave de servicio.
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

// GET: devuelve los IDs de los setups que ha likeado el usuario autenticado
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return NextResponse.json({ likedIds: [] })

    const user = await getUserFromToken(token)
    if (!user) return NextResponse.json({ likedIds: [] })

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || ''
    if (!userName) return NextResponse.json({ likedIds: [] })

    const { data, error } = await supabaseAdmin
      .from('setup_likes').select('setup_id').eq('user_name', userName)

    if (error) {
      console.error('Error leyendo setup_likes:', error)
      return NextResponse.json({ likedIds: [] })
    }

    return NextResponse.json({ likedIds: (data || []).map(r => r.setup_id) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ likedIds: [] })
  }
}

// POST: da o quita el like, y mantiene el contador de setups.likes sincronizado
export async function POST(req: NextRequest) {
  try {
    const { id, action, sessionToken } = await req.json() // action: 'like' | 'unlike'
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    if (!sessionToken) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })

    const user = await getUserFromToken(sessionToken)
    if (!user) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || ''
    if (!userName) return NextResponse.json({ error: 'No se pudo identificar al usuario' }, { status: 400 })

    if (action === 'like') {
      // Intentamos registrar el like. Si ya existía (clave duplicada), no lo
      // contamos dos veces: simplemente devolvemos el contador actual.
      const { error: insertError } = await supabaseAdmin
        .from('setup_likes')
        .insert([{ user_name: userName, setup_id: id }])

      if (insertError) {
        if (insertError.code === '23505') {
          const { data: setup } = await supabaseAdmin.from('setups').select('likes').eq('id', id).single()
          return NextResponse.json({ likes: setup?.likes || 0 })
        }
        throw insertError
      }

      const { data, error } = await supabaseAdmin.rpc('toggle_like', { setup_id: id, delta: 1 })
      if (error) throw error
      return NextResponse.json({ likes: data })

    } else {
      // Quitamos el registro del like. Si no existía, no descontamos nada.
      const { error: deleteError, count } = await supabaseAdmin
        .from('setup_likes')
        .delete({ count: 'exact' })
        .eq('user_name', userName)
        .eq('setup_id', id)

      if (deleteError) throw deleteError

      if (!count) {
        const { data: setup } = await supabaseAdmin.from('setups').select('likes').eq('id', id).single()
        return NextResponse.json({ likes: setup?.likes || 0 })
      }

      const { data, error } = await supabaseAdmin.rpc('toggle_like', { setup_id: id, delta: -1 })
      if (error) throw error
      return NextResponse.json({ likes: data })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
