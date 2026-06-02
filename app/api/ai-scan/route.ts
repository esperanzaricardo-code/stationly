import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor' }, { status: 500 })

    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analiza esta imagen de un setup de ordenador/gaming/streaming.
Identifica todos los componentes, periféricos y productos visibles con el mayor detalle posible (marca y modelo si puedes reconocerlos).
Responde ÚNICAMENTE con un array JSON de strings, sin ningún otro texto ni explicación. Ejemplo:
["RTX 4090", "Samsung Odyssey G7 27\\"", "Keychron Q1", "Logitech MX Master 3", "Shure SM7B"]
Si no puedes identificar la marca/modelo exacto, describe el componente genéricamente. Máximo 10 items.`,
            },
          ],
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return NextResponse.json({ error: 'La IA no devolvió formato válido' }, { status: 500 })

    const components: string[] = JSON.parse(match[0])
    return NextResponse.json({ components })
  } catch (err: unknown) {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
