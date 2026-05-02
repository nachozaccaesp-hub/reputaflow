import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens } from '@/lib/google'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const code = request.nextUrl.searchParams.get('code')
  const clientId = request.nextUrl.searchParams.get('state')

  if (!code || !clientId) {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_failed', request.url))
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const service = createServiceClient()
    await service
      .from('clients')
      .update({
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
      })
      .eq('id', clientId)

    return NextResponse.redirect(
      new URL(`/dashboard/clients/${clientId}?connected=1`, request.url)
    )
  } catch {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_failed', request.url))
  }
}
