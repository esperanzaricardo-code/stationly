import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente admin — único capaz de borrar la cuenta de autenticación (auth.admin)
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

// Extrae el nombre de archivo guardado en Storage a partir de la URL pública
function extractStorageFilename(imageUrl: string | null): string | null {
  if (!imageUrl) return null
  const parts = imageUrl.split('/setups/')
  if (parts.length < 2) return null
  try { return decodeURIComponent(parts[1].split('?')[0]) } catch { return parts[1].split('?')[0] }
}

export async function DELETE(req: NextRequest) {
  try {
    const { sessionToken } = await req.json()

    if (!sessionToken) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const user = await getUserFromToken(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || ''
    if (!userName) {
      return NextResponse.json({ error: 'No se pudo identificar la cuenta' }, { status: 400 })
    }

    // 1. Localizar los setups del usuario para poder borrar sus fotos de Storage
    const { data: setups } = await supabaseAdmin
      .from('setups').select('id, image_url').ilike('user_name', userName)

    const setupIds = (setups || []).map(s => s.id)
    const filenames = (setups || [])
      .map(s => extractStorageFilename(s.image_url))
      .filter((f): f is string => !!f)

    // 2. Borrar las fotos de Storage
    if (filenames.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage.from('setups').remove(filenames)
      if (storageError) console.error('Error borrando fotos de Storage:', storageError)
    }

    // 3. Borrar reportes relacionados (los que hizo el usuario y los que recibió en sus setups)
    const { error: reportsByUserError } = await supabaseAdmin
      .from('reports').delete().eq('user_name', userName)
    if (reportsByUserError) console.error('Error borrando reportes del usuario:', reportsByUserError)

    if (setupIds.length > 0) {
      const { error: reportsBySetupError } = await supabaseAdmin
        .from('reports').delete().in('setup_id', setupIds)
      if (reportsBySetupError) console.error('Error borrando reportes de sus setups:', reportsBySetupError)
    }

    // 4. Borrar los setups
    const { error: setupsError } = await supabaseAdmin
      .from('setups').delete().ilike('user_name', userName)
    if (setupsError) console.error('Error borrando setups:', setupsError)

    // 5. Borrar el perfil
    const { error: profileError } = await supabaseAdmin
      .from('profiles').delete().eq('username', userName)
    if (profileError) console.error('Error borrando perfil:', profileError)

    // 6. Borrar la cuenta de autenticación — paso final e irreversible
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
