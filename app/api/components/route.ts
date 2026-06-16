import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
export async function POST(req: NextRequest) {
  try {
    const { text, imageBase64, mediaType } = await req.json()
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    const client = new Anthropic({ apiKey })
    const prompt = `Analiza los componentes de PC o setup que se mencionan.
Para cada producto:
1. Normaliza el nombre al nombre oficial completo con marca y modelo
2. Clasifícalo como "internal" (componentes dentro del PC) o "peripheral" (lo que está fuera)
3. Añade una subcategoría "category":
   - "internal": "CPU", "GPU", "RAM", "Placa base", "Almacenamiento", "Fuente de alimentación", "Refrigeración", "Caja"
   - "peripheral": "Monitor", "Teclado", "Ratón", "Auriculares", "Micrófono", "Webcam", "Altavoces", "Silla", "Escritorio", "Iluminación", "Capturadora", "Interfaz de audio", "Stream Deck", "Otro"
4. Si reconoces el producto exactamente: "confident": true. NO añadas "did_you_mean"
5. Si no lo reconoces exactamente pero hay algo similar: "confident": false, "did_you_mean": "nombre sugerido"
6. Si no reconoces nada parecido: "confident": false, "unknown": true

REGLA CRÍTICA sobre el campo "name":
- "name" debe ser SIEMPRE un nombre de producto limpio y nada más: marca + modelo si lo sabes, o solo la categoría genérica del producto si no sabes el modelo exacto (ej: "Apple iMac", "Auriculares gaming", "Altavoces de escritorio").
- NUNCA escribas paréntesis, instrucciones, preguntas, ni texto dirigido al usuario dentro de "name". Prohibido escribir cosas como "(especificar modelo: X, Y, etc.)", "(confirmar modelo)", "(modelo desconocido)" o similares.
- Si no puedes determinar el modelo exacto, usa el nombre genérico correcto del producto y marca "confident": false (y "did_you_mean" solo si tienes una sugerencia concreta de modelo, nunca una instrucción).
- Ejemplo CORRECTO cuando no sabes el modelo: { "name": "Apple iMac", "type": "peripheral", "category": "Monitor", "confident": false }
- Ejemplo INCORRECTO (nunca hagas esto): { "name": "Apple iMac (especificar modelo: iMac 24\\" M3, iMac 27\\", etc.)", ... }

Responde ÚNICAMENTE con un array JSON. Ejemplo:
[
  { "name": "AMD Ryzen 9 7950X", "type": "internal", "category": "CPU", "confident": true },
  { "name": "Logitech G Pro X Superlight 2", "type": "peripheral", "category": "Ratón", "confident": true },
  { "name": "Keychron Q1 Pro", "type": "peripheral", "category": "Teclado", "confident": false, "did_you_mean": "Keychron Q1 Pro" },
  { "name": "cosa rara", "type": "peripheral", "category": "Otro", "confident": false, "unknown": true }
]`
    const content: Anthropic.MessageParam['content'] = imageBase64
      ? [
          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: `Identifica el producto tecnológico de esta imagen y devuélvelo en este formato JSON:\n${prompt}` }
        ]
      : [{ type: 'text', text: `${prompt}\n\nComponentes a identificar: "${text}"` }]
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content }]
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
