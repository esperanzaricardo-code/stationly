import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: 'Texto requerido' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `El usuario ha escrito una lista de componentes de su PC o setup. Puede estar separado por comas, espacios, saltos de línea o sin ningún separador claro.

Texto del usuario: "${text}"

Para cada producto que identifiques:
1. Normaliza el nombre al nombre oficial completo con marca y modelo
2. Clasifícalo como "peripheral" (monitor, teclado, ratón, auriculares, micrófono, webcam, altavoces, silla, escritorio, iluminación, capturadora) o "internal" (CPU, GPU, RAM, placa base, SSD, HDD, fuente de alimentación, refrigeración, caja)
3. Si reconoces el producto con confianza, marca "confident": true
4. Si no reconoces el producto exacto pero hay algo similar, marca "confident": false y añade "did_you_mean" con tu sugerencia
5. Si no reconoces nada parecido, marca "unknown": true y usa el nombre tal como lo escribió el usuario

Responde ÚNICAMENTE con un array JSON, sin texto adicional. Ejemplo:
[
  { "name": "NVIDIA GeForce RTX 4090", "type": "internal", "confident": true },
  { "name": "Logitech G Pro X Superlight 2", "type": "peripheral", "confident": true },
  { "name": "Keychron Q1 Pro", "type": "peripheral", "confident": false, "did_you_mean": "Keychron Q1" },
  { "name": "silla gaming", "type": "peripheral", "confident": false, "unknown": true }
]`
      }]
    })

    const text_response = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text_response.match(/\[[\s\S]*\]/)
    if (!match) return NextResponse.json({ error: 'La IA no devolvió formato válido' }, { status: 500 })
    const components = JSON.parse(match[0])
    return NextResponse.json({ components })

  } catch (err: unknown) {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
