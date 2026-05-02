import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const FROM = process.env.TWILIO_WHATSAPP_FROM!

export async function sendWhatsApp(to: string, body: string): Promise<string> {
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  const msg = await client.messages.create({ from: FROM, to: toFormatted, body })
  return msg.sid
}

export function buildReviewMessage(
  businessName: string,
  authorName: string,
  rating: number,
  reviewText: string | null,
  draft: string
): string {
  const stars = '⭐'.repeat(rating)
  const excerpt = reviewText
    ? reviewText.length > 200 ? reviewText.slice(0, 197) + '…' : reviewText
    : '(sin texto)'

  return `${stars} Nueva reseña — ${businessName}
De: ${authorName} · ${rating}/5
"${excerpt}"

Borrador de respuesta:
"${draft}"

Responde:
✅ SÍ — para publicar
✏️ EDITAR — escribe tu respuesta alternativa
❌ NO — para ignorar`
}

export function buildWeeklySummaryMessage(
  businessName: string,
  weekStart: string,
  received: number,
  responded: number,
  avgRating: number | null,
  prevAvgRating: number | null,
  pending: number
): string {
  const date = new Date(weekStart).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long'
  })

  let ratingLine = `⭐ Rating medio: ${avgRating?.toFixed(1) ?? 'N/D'}`
  if (avgRating !== null && prevAvgRating !== null) {
    const diff = avgRating - prevAvgRating
    const sign = diff >= 0 ? '+' : ''
    ratingLine += `\n📈 Vs. semana anterior: ${sign}${diff.toFixed(1)}`
  }

  let pendingLine = ''
  if (pending > 0) {
    pendingLine = `\n⚠️ Tenés ${pending} reseña${pending > 1 ? 's' : ''} pendiente${pending > 1 ? 's' : ''}.`
  }

  return `📊 Resumen semanal — ${businessName}
Semana del ${date}

📥 Reseñas recibidas: ${received}
✅ Respondidas: ${responded}
${ratingLine}${pendingLine}`
}

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  )
}
