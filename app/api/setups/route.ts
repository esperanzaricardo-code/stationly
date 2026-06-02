import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side client (uses anon key — Storage RLS must allow inserts)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('setups')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const userName = formData.get('user_name') as string
    const title    = formData.get('title') as string
    const category = formData.get('category') as string
    const tagsRaw  = formData.get('tags') as string
    const file     = formData.get('image') as File | null

    if (!userName || !title) {
      return NextResponse.json({ error: 'Nombre y título son obligatorios' }, { status: 400 })
    }

    const tags: string[] = tagsRaw ? JSON.parse(tagsRaw) : []

    let image_url: string | null = null

    if (file && file.size > 0) {
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from('setups')
        .upload(filename, buffer, { contentType: file.type, upsert: false })

      if (uploadError) {
        console.error('Storage error:', uploadError)
        // Don't fail the whole request — just no image
      } else {
        const { data: urlData } = supabase.storage
          .from('setups')
          .getPublicUrl(filename)
        image_url = urlData.publicUrl
      }
    }

    const { data, error } = await supabase
      .from('setups')
      .insert([{ user_name: userName, title, category, tags, image_url, likes: 0 }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
