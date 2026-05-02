import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendWhatsApp, buildWeeklySummaryMessage } from '@/lib/twilio'

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  const xHeader = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  return xHeader === cronSecret || authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const weekStart = new Date(today.setDate(diff))
  weekStart.setHours(0, 0, 0, 0)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const prevWeekStartStr = prevWeekStart.toISOString().split('T')[0]

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('active', true)

  const results: Record<string, string> = {}

  for (const client of clients ?? []) {
    try {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const { data: reviews } = await supabase
        .from('reviews')
        .select('id, rating, status')
        .eq('client_id', client.id)
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString())

      const received = reviews?.length ?? 0
      const responded = reviews?.filter(r => r.status === 'published').length ?? 0
      const pending = reviews?.filter(r => r.status === 'pending').length ?? 0
      const avgRating = received > 0
        ? reviews!.reduce((s, r) => s + r.rating, 0) / received
        : null

      const { data: prevSummary } = await supabase
        .from('weekly_summaries')
        .select('avg_rating')
        .eq('client_id', client.id)
        .eq('week_start', prevWeekStartStr)
        .single()

      const body = buildWeeklySummaryMessage(
        client.business_name,
        weekStartStr,
        received,
        responded,
        avgRating,
        prevSummary?.avg_rating ?? null,
        pending
      )

      await sendWhatsApp(client.whatsapp_number, body)

      await supabase
        .from('weekly_summaries')
        .upsert(
          {
            client_id: client.id,
            week_start: weekStartStr,
            reviews_received: received,
            reviews_responded: responded,
            avg_rating: avgRating,
            sent_at: new Date().toISOString(),
          },
          { onConflict: 'client_id,week_start' }
        )

      results[client.id] = 'ok'
    } catch (err: unknown) {
      results[client.id] = String(err)
    }
  }

  return NextResponse.json({ ok: true, weekStart: weekStartStr, results })
}
