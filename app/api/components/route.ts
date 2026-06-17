import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// Cliente admin — la tabla vision_usage no tiene políticas públicas,
// así que solo se puede leer/escribir con la clave de servicio.
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

// Límite: máximo de usos de la IA de identificación de componentes por usuario y por hora
const RATE_LIMIT_MAX = 40
const RATE_LIMIT_WINDOW_MINUTES = 60

export async function POST(req: NextRequest) {
  try {
    const { text, imageBase64, mediaType, sessionToken } = await req.json()

    if (!sessionToken) {
      return NextResponse.json({ error: 'Debes iniciar sesión para usar esta función' }, { status: 401 })
    }

    const user = await getUserFromToken(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Sesión inválida. Inicia sesión de nuevo.' }, { status: 401 })
    }

    const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'usuario'

    // Limpiamos los registros de este usuario que ya están fuera de la ventana de tiempo,
    // así la tabla no crece sin control y no necesitamos un proceso aparte de limpieza.
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
    await supabaseAdmin.from('vision_usage').delete().eq('user_name', userName).lt('created_at', windowStart)

    const { count, error: countError } = await supabaseAdmin
      .from('vision_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_name', userName)

    if (countError) console.error('Error comprobando el rate limit:', countError)

    if ((count || 0) >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Has usado demasiadas veces la identificación de componentes. Inténtalo de nuevo dentro de un rato.' },
        { status: 429 }
      )
    }

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
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content }]
    })
    const text_response = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text_response.match(/\[[\s\S]*\]/)
    if (!match) return NextResponse.json({ error: 'La IA no devolvió formato válido' }, { status: 500 })
    const components = JSON.parse(match[0])

    // Registramos este uso para que cuente en el límite por hora
    await supabaseAdmin.from('vision_usage').insert([{ user_name: userName }])

    return NextResponse.json({ components })
  } catch (err: unknown) {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
