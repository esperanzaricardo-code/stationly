import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

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

const RATE_LIMIT_MAX = 40
const RATE_LIMIT_WINDOW_MINUTES = 60

export async function POST(req: NextRequest) {
    try {
          const { imageBase64, mediaType, singleComponent, textOnly, query, sessionToken } = await req.json()

      if (!sessionToken) {
              return NextResponse.json({ error: 'Debes iniciar sesion para usar esta funcion' }, { status: 401 })
      }

      const user = await getUserFromToken(sessionToken)
          if (!user) {
                  return NextResponse.json({ error: 'Sesion invalida. Inicia sesion de nuevo.' }, { status: 401 })
          }

      const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'usuario'

      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
          await supabaseAdmin.from('vision_usage').delete().eq('user_name', userName).lt('created_at', windowStart)

      const { count } = await supabaseAdmin
            .from('vision_usage')
            .select('id', { count: 'exact', head: true })
            .eq('user_name', userName)

      if ((count || 0) >= RATE_LIMIT_MAX) {
              return NextResponse.json(
                { error: 'Has usado demasiadas veces el escaner. Intentalo de nuevo dentro de un rato.' },
                { status: 429 }
                      )
      }

      const apiKey = process.env.ANTHROPIC_API_KEY
          if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor' }, { status: 500 })

      const client = new Anthropic({ apiKey })

      if (textOnly && query) {
              const message = await client.messages.create({
                        model: 'claude-sonnet-4-5',
                        max_tokens: 100,
                        messages: [{
                                    role: 'user',
                                    content: `Normaliza este nombre de producto tecnologico al nombre oficial completo con marca y modelo: "${query}".
                                    Responde UNICAMENTE con un array JSON de un solo string. Ejemplo: ["NVIDIA GeForce RTX 4090 24GB"]
                                    Si no reconoces el producto, devuelve el nombre tal como esta: ["${query}"]`
                        }]
              })
              const text = message.content[0].type === 'text' ? message.content[0].text : ''
              const match = text.match(/\[[\s\S]*\]/)
              await supabaseAdmin.from('vision_usage').insert([{ user_name: userName }])
              if (!match) return NextResponse.json({ components: [query] })
              const components: string[] = JSON.parse(match[0])
              return NextResponse.json({ components })
      }

      if (!imageBase64) return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 })

      const prompt = singleComponent
            ? `Identifica el producto tecnologico que aparece en esta imagen.
            Devuelve UNICAMENTE el nombre del producto con marca y modelo si puedes reconocerlos.
            Si no puedes identificar la marca o modelo exacto, describe el tipo de producto genericamente.
            Responde UNICAMENTE con un array JSON de un solo string, sin ningun otro texto. Ejemplo:
            ["Logitech G Pro X Superlight 2"]`
              : `Analiza esta imagen de un setup de ordenador/gaming/streaming.
              Identifica UNICAMENTE productos tecnologicos del setup.
              Si puedes identificar marca y modelo exacto, incluyelos. Si no, describe el tipo genericamente.
              Responde UNICAMENTE con un array JSON de strings, sin ningun otro texto.
              Maximo 10 items.`

      const message = await client.messages.create({
              model: 'claude-sonnet-4-5',
              max_tokens: 512,
              messages: [{
                        role: 'user',
                        content: [
                          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
                          { type: 'text', text: prompt },
                                  ],
              }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
          const match = text.match(/\[[\s\S]*\]/)
          await supabaseAdmin.from('vision_usage').insert([{ user_name: userName }])
          if (!match) return NextResponse.json({ error: 'La IA no devolvio formato valido' }, { status: 500 })
          const components: string[] = JSON.parse(match[0])
          return NextResponse.json({ components })

    } catch (err: unknown) {
          console.error(err)
          const message = err instanceof Error ? err.message : 'Error desconocido'
          return NextResponse.json({ error: message }, { status: 500 })
    }
}
