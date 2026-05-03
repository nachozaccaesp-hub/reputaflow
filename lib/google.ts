import { google } from 'googleapis'
import { createServiceClient } from './supabase/server'

function createOAuthClient() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${appUrl}/api/auth/google/callback`
  )
}

export function getAuthUrl(clientId: string): string {
  return createOAuthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/business.manage',
    ],
    state: clientId,
  })
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await createOAuthClient().getToken(code)
  return tokens
}

async function getAuthenticatedClient(
  accessToken: string,
  refreshToken: string,
  clientDbId: string
) {
  const client = createOAuthClient()

  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      const supabase = createServiceClient()
      await supabase
        .from('clients')
        .update({ google_access_token: tokens.access_token })
        .eq('id', clientDbId)
    }
  })

  return client
}

export interface GoogleReview {
  reviewId: string
  reviewer: { displayName: string }
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE'
  comment?: string
  createTime: string
}

const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5
}

export async function fetchReviews(
  accessToken: string,
  refreshToken: string,
  placeId: string,
  clientDbId: string
): Promise<GoogleReview[]> {
  const auth = await getAuthenticatedClient(accessToken, refreshToken, clientDbId)

  const resp = await fetch(
    `https://mybusinessaccountmanagement.googleapis.com/v1/accounts`,
    { headers: { Authorization: `Bearer ${auth.credentials.access_token}` } }
  )

  if (!resp.ok) throw new Error(`Google accounts API error: ${resp.status}`)

  const accountsData = await resp.json()
  const accountName = accountsData.accounts?.[0]?.name
  if (!accountName) throw new Error('No Google Business account found')

  const reviewsResp = await fetch(
    `https://mybusiness.googleapis.com/v4/${accountName}/locations/${placeId}/reviews?pageSize=50`,
    { headers: { Authorization: `Bearer ${auth.credentials.access_token}` } }
  )

  if (!reviewsResp.ok) throw new Error(`Google reviews API error: ${reviewsResp.status}`)

  const data = await reviewsResp.json()
  return data.reviews ?? []
}

export async function publishReply(
  accessToken: string,
  refreshToken: string,
  placeId: string,
  reviewId: string,
  replyText: string,
  clientDbId: string
): Promise<void> {
  const auth = await getAuthenticatedClient(accessToken, refreshToken, clientDbId)

  const resp = await fetch(
    `https://mybusiness.googleapis.com/v4/accounts/-/locations/${placeId}/reviews/${reviewId}/reply`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${auth.credentials.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment: replyText }),
    }
  )

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Google reply API error: ${resp.status} — ${err}`)
  }
}

export { STAR_MAP }
