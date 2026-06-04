import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, singleComponent } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor' }, { status: 500 })

    const client = new Anthropic({ apiKey })

    const prompt = singleComponent
      ? `Identifica el producto tecnológico que aparece en esta imagen.
Devuelve ÚNICAMENTE el nombre del producto con marca y modelo si puedes reconocerlos.
Si no puedes identificar la marca o modelo exacto, describe el tipo de producto genéricamente.
Responde ÚNICAMENTE con un array JSON de un solo string, sin ningún otro texto. Ejemplo:
["Logitech G Pro X Superlight 2"]`
      : `Analiza esta imagen de un setup de ordenador/gaming/streaming.

Identifica ÚNICAMENTE los siguientes tipos de productos tecnológicos:
- Monitores y pantallas
- Teclados
- Ratones y alfombrillas
- Auriculares y cascos
- Micrófonos y brazos de micrófono
- Webcams
- Altavoces
- Sillas gaming o de oficina
- Escritorios gaming
- Iluminación LED o RGB
- Capturadoras y equipos de streaming
- Torres de PC y componentes visibles externamente

NO incluyas: decoración, figuras, cuadros, plantas, bebidas, libros, juguetes, ni ningún objeto que no sea tecnología de uso en el setup.

Si puedes identificar marca y modelo exacto, inclúyelos. Si no, describe el tipo de producto genéricamente.

Responde ÚNICAMENTE con un array JSON de strings, sin ningún otro texto. Ejemplo:
["LG UltraWide 34\\"", "Keychron Q1", "Logitech G Pro X", "Shure SM7B"]

Máximo 10 items.`

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
            { type: 'text', text: prompt },
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
