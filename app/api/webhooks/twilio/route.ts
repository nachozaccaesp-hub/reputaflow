import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateTwilioSignature } from '@/lib/twilio'
import { publishReply } from '@/lib/google'
import { isDemoClient } from '@/lib/demo-reviews'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-twilio-signature') ?? ''
  const url = request.url

  const rawBody = await request.text()
  const params = Object.fromEntries(new URLSearchParams(rawBody).entries())

  if (!validateTwilioSignature(signature, url, params)) {
    return new NextResponse('<Response/>', {
      status: 403,
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  const from: string = params.From ?? ''
  const body: string = (params.Body ?? '').trim()

  const supabase = createServiceClient()

  const normalised = from.replace('whatsapp:', '')
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('whatsapp_number', normalised)
    .single()

  if (!client) {
    return new NextResponse('<Response/>', { headers: { 'Content-Type': 'text/xml' } })
  }

  const { data: lastResponse } = await supabase
    .from('responses')
    .select('id, draft, review_id')
    .eq('twilio_message_sid', params.InReplyTo ?? '')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const pendingResponse = lastResponse ?? await (async () => {
    const { data: pendingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('client_id', client.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!pendingReview) return null

    const { data: resp } = await supabase
      .from('responses')
      .select('id, draft, review_id')
      .eq('review_id', pendingReview.id)
      .maybeSingle()

    return resp
  })()

  if (!pendingResponse) {
    return new NextResponse('<Response/>', { headers: { 'Content-Type': 'text/xml' } })
  }

  const upper = body.toUpperCase().trim()
  const isSi = upper === 'SÍ' || upper === 'SI' || upper === '1' || upper.startsWith('SÍ ')
  const isNo = upper === 'NO' || upper === '2'

  if (isNo) {
    await supabase
      .from('reviews')
      .update({ status: 'ignored' })
      .eq('id', pendingResponse.review_id)
    return new NextResponse('<Response/>', { headers: { 'Content-Type': 'text/xml' } })
  }

  const finalText = isSi ? pendingResponse.draft : body

  await supabase
    .from('responses')
    .update({ final: finalText, approved_at: new Date().toISOString() })
    .eq('id', pendingResponse.id)

  const { data: review } = await supabase
    .from('reviews')
    .select('google_review_id')
    .eq('id', pendingResponse.review_id)
    .single()

  if (review) {
    const demo = isDemoClient(client.google_place_id)

    if (!demo && client.google_access_token) {
      try {
        await publishReply(
          client.google_access_token,
          client.google_refresh_token,
          client.google_place_id,
          review.google_review_id,
          finalText ?? '',
          client.id
        )
      } catch (err) {
        console.error('Error publishing reply to Google:', err)
      }
    }

    await supabase
      .from('responses')
      .update({ published_at: new Date().toISOString() })
      .eq('id', pendingResponse.id)

    await supabase
      .from('reviews')
      .update({ status: 'published' })
      .eq('id', pendingResponse.review_id)
  }

  return new NextResponse('<Response/>', { headers: { 'Content-Type': 'text/xml' } })
}
