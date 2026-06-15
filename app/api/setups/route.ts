import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// Cliente público para lectura e inserción
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Cliente admin para DELETE y UPDATE — bypasea RLS pero verificamos ownership en código
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

async function moderateImage(base64: string, mediaType: string): Promise<{ safe: boolean; reason?: string }> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp', data: base64 },
          },
          {
            type: 'text',
            text: 'Does this image contain any of the following: nudity, sexual content, graphic violence, gore, or offensive/hateful content? Reply with only YES or NO.',
          },
        ],
      }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text.trim().toUpperCase() : 'NO'
    if (text.startsWith('YES')) return { safe: false, reason: 'La imagen contiene contenido inapropiado.' }
    return { safe: true }
  } catch (err) {
    console.error('Moderation error:', err)
    return { safe: true }
  }
}

// =========================================================
// Detección simple de categoría a partir del nombre del componente
// =========================================================
function detectCategory(name: string): string {
  const n = name.toLowerCase()

  // GPU
  if (/(rtx|gtx|radeon|rx \d|geforce|arc a\d|nvidia|amd radeon)/.test(n)) return 'GPU'

  // CPU
  if (/(ryzen|core i\d|intel|threadripper|xeon|pentium|celeron|apu)/.test(n)) return 'CPU'

  // Motherboard
  if (/(placa base|motherboard|mainboard|chipset|b550|b650|x570|x670|z690|z790|h610|a520)/.test(n)) return 'Placa Base'

  // RAM
  if (/(ram|ddr3|ddr4|ddr5|memoria)/.test(n)) return 'RAM'

  // Storage
  if (/(ssd|nvme|hdd|disco duro|m\.2|sata)/.test(n)) return 'Almacenamiento'

  // PSU
  if (/(fuente|psu|80\+|bronze|gold|platinum|fully modular|watts|w\b)/.test(n)) return 'Fuente de Alimentación'

  // Case
  if (/(torre|case|gabinete|chasis|chassis|caja pc|mid tower|full tower)/.test(n)) return 'Caja'

  // Cooling
  if (/(refrigeraci[oó]n|cooler|aio|ventilador|fan|disipador|radiador|water cooling)/.test(n)) return 'Refrigeración'

  // Monitor
  if (/(monitor|pantalla|display|hz\b|144hz|165hz|240hz|curvo|ultrawide)/.test(n)) return 'Monitor'

  // Keyboard
  if (/(teclado|keyboard|mecánico|mecanico|switches)/.test(n)) return 'Teclado'

  // Mouse
  if (/(rat[oó]n|mouse|dpi)/.test(n)) return 'Ratón'

  // Headset
  if (/(auriculares|headset|cascos|micr[oó]fono|headphone)/.test(n)) return 'Audio'

  // Webcam
  if (/(webcam|c[aá]mara)/.test(n)) return 'Webcam'

  // Chair / Desk
  if (/(silla|chair)/.test(n)) return 'Silla'
  if (/(escritorio|mesa|desk)/.test(n)) return 'Escritorio'

  // Mousepad
  if (/(alfombrilla|mousepad|pad)/.test(n)) return 'Mousepad'

  // Microphone (standalone)
  if (/(micr[oó]fono|microphone|mic\b)/.test(n)) return 'Micrófono'

  // Default
  return 'Otros'
}

export async function GET() {
  const { data, error } = await supabase
    .from('setups').select('*')
    .order('created_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const sessionToken = formData.get('session_token') as string
    const title       = formData.get('title') as string
    const category    = formData.get('category') as string
    const tagsRaw     = formData.get('tags') as string
    const file        = formData.get('image') as File | null

    if (!sessionToken) {
      return NextResponse.json({ error: 'Debes iniciar sesión para publicar' }, { status: 401 })
    }

    const user = await getUserFromToken(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Sesión inválida. Inicia sesión de nuevo.' }, { status: 401 })
    }

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'usuario'

    if (!title) {
      return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
    }

    const rawTags: string[] = tagsRaw ? JSON.parse(tagsRaw) : []
    const tags = rawTags.map((name: string) => ({
      name, type: 'peripheral', links: [],
    }))

    let image_url: string | null = null

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      const mediaType = file.type || 'image/jpeg'

      const moderation = await moderateImage(base64, mediaType)
      if (!moderation.safe) {
        return NextResponse.json(
          { error: moderation.reason || 'La imagen no cumple las normas de la comunidad.' },
          { status: 400 }
        )
      }

      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('setups').upload(filename, buffer, { contentType: file.type, upsert: false })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('setups').getPublicUrl(filename)
        image_url = urlData.publicUrl
      }
    }

    const { data, error } = await supabase
      .from('setups')
      .insert([{ user_name: userName, title, category, tags, components: [], image_url, likes: 0 }])
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Sync component index: nuevo setup tiene components: [] -> no-op, pero lo dejamos por consistencia
    await supabaseAdmin.rpc('sync_component_index', {
      old_components: [],
      new_components: [],
    })

    return NextResponse.json(data, { status: 201 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { setupId, sessionToken, updates } = await req.json()

    if (!sessionToken) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const user = await getUserFromToken(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'usuario'

    // Verificamos ownership antes de actualizar
    const { data: existing } = await supabaseAdmin
      .from('setups').select('user_name, components').eq('id', setupId).single()

    if (!existing || existing.user_name.toLowerCase() !== userName.toLowerCase()) {
      return NextResponse.json({ error: 'No tienes permiso para editar este setup' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('setups')
      .update(updates)
      .eq('id', setupId)
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Sync component index si "components" cambió
    if (updates.components !== undefined) {
      const oldComponents = (existing.components || []).map((c: { name: string }) => ({
        name: c.name,
        category: detectCategory(c.name),
      }))
      const newComponents = (updates.components || []).map((c: { name: string }) => ({
        name: c.name,
        category: detectCategory(c.name),
      }))

      await supabaseAdmin.rpc('sync_component_index', {
        old_components: oldComponents,
        new_components: newComponents,
      })
    }

    return NextResponse.json(data)

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { setupId, sessionToken } = await req.json()

    if (!sessionToken) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const user = await getUserFromToken(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'usuario'

    // Verificamos ownership antes de eliminar
    const { data: existing } = await supabaseAdmin
      .from('setups').select('user_name, components').eq('id', setupId).single()

    if (!existing || existing.user_name.toLowerCase() !== userName.toLowerCase()) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar este setup' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('setups').delete().eq('id', setupId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Sync component index: setup eliminado -> decrementar todos sus componentes
    const oldComponents = (existing.components || []).map((c: { name: string }) => ({
      name: c.name,
      category: detectCategory(c.name),
    }))

    await supabaseAdmin.rpc('sync_component_index', {
      old_components: oldComponents,
      new_components: [],
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
