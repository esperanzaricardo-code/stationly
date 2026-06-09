import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Sesión inválida. Inicia sesión de nuevo.' }, { status: 401 })
    }

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'usuario'

    if (!title) {
      return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
    }

    const rawTags: string[] = tagsRaw ? JSON.parse(tagsRaw) : []
    const tags = rawTags.map((name: string) => ({
      name,
      type: 'peripheral',
      links: [],
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
      .insert([{
        user_name: userName,
        title,
        category,
        tags,
        components: [],
        image_url,
        likes: 0,
      }])
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'usuario'

    const { data: existing } = await supabase
      .from('setups').select('user_name').eq('id', setupId).single()

    if (!existing || existing.user_name.toLowerCase() !== userName.toLowerCase()) {
      return NextResponse.json({ error: 'No tienes permiso para editar este setup' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('setups')
      .update(updates)
      .eq('id', setupId)
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'usuario'

    const { data: existing } = await supabase
      .from('setups').select('user_name').eq('id', setupId).single()

    if (!existing || existing.user_name.toLowerCase() !== userName.toLowerCase()) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar este setup' }, { status: 403 })
    }

    const { error } = await supabase
      .from('setups').delete().eq('id', setupId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
