import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json() // action: 'like' | 'unlike'
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    // Atomic increment/decrement using Supabase RPC
    const { data, error } = await supabase.rpc('toggle_like', {
      setup_id: id,
      delta: action === 'like' ? 1 : -1,
    })

    if (error) {
      // Fallback: manual read-modify-write
      const { data: setup } = await supabase
        .from('setups')
        .select('likes')
        .eq('id', id)
        .single()
      if (!setup) return NextResponse.json({ error: 'Setup no encontrado' }, { status: 404 })

      const newLikes = Math.max(0, (setup.likes || 0) + (action === 'like' ? 1 : -1))
      const { data: updated, error: updateError } = await supabase
        .from('setups')
        .update({ likes: newLikes })
        .eq('id', id)
        .select('likes')
        .single()
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
      return NextResponse.json({ likes: updated.likes })
    }

    return NextResponse.json({ likes: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
