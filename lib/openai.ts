import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateReviewResponse(
  businessName: string,
  toneInstructions: string,
  authorName: string,
  rating: number,
  reviewText: string
): Promise<string> {
  const systemPrompt = `Eres el gestor de reputación online de ${businessName}, un negocio turístico en España.
Tu tarea es redactar respuestas profesionales a reseñas de Google.
Instrucciones de tono: ${toneInstructions}
Reglas:
- Máximo 150 palabras
- Siempre agradecer, incluso en reseñas negativas
- En reseñas negativas: reconocer, no excusarse en exceso, ofrecer contacto directo
- Nunca mencionar compensaciones ni descuentos
- Responder siempre en el idioma de la reseña
- No usar emojis salvo que el tono del negocio los indique`

  const userPrompt = `Reseña de ${authorName} (${rating}/5 estrellas):
"${reviewText || '(sin texto, solo valoración)'}"

Redacta una respuesta profesional.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 300,
    temperature: 0.7,
  })

  return completion.choices[0].message.content?.trim() ?? ''
}
