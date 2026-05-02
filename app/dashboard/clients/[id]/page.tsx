import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ForceGenerateButton from './ForceGenerateButton'
import ConnectGoogleButton from './ConnectGoogleButton'
import SeedDemoButton from './SeedDemoButton'
import { isDemoClient } from '@/lib/demo-reviews'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  published: 'Publicada',
  ignored: 'Ignorada',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  ignored: 'bg-gray-100 text-gray-500',
}

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServiceClient()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!client) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, responses(*)')
    .eq('client_id', params.id)
    .order('published_at', { ascending: false })
    .limit(50)

  const totalReviews = reviews?.length ?? 0
  const avgRating = totalReviews > 0
    ? (reviews!.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : null
  const pending = reviews?.filter(r => r.status === 'pending').length ?? 0
  const demo = isDemoClient(client.google_place_id)

  return (
    <div>
      {demo && (
        <div className="mb-5 flex items-start justify-between gap-4 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
          <div className="flex items-start gap-3 text-sm text-violet-800">
            <span className="text-base leading-snug mt-0.5">🧪</span>
            <div>
              <span className="font-semibold">Modo demo activo.</span>{' '}
              Las reseñas son ficticias y las respuestas{' '}
              <strong>no se publican en Google</strong>.
              El flujo de IA y WhatsApp funciona igual que en producción.
            </div>
          </div>
          <div className="flex-shrink-0">
            <SeedDemoButton clientId={client.id} hasReviews={totalReviews > 0} />
          </div>
        </div>
      )}
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Clientes</Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{client.business_name}</h1>
              {demo && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-600 border border-violet-200">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{client.name} · {client.whatsapp_number}</p>
          </div>
          {!demo && (
            <ConnectGoogleButton
              clientId={client.id}
              connected={!!client.google_access_token}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total reseñas" value={String(totalReviews)} />
        <StatCard label="Rating medio" value={avgRating ? `⭐ ${avgRating}` : '—'} />
        <StatCard label="Pendientes" value={String(pending)} highlight={pending > 0} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Reseñas</h2>
        </div>

        {!reviews || reviews.length === 0 ? (
          <div className="p-10 text-center">
            {demo ? (
              <>
                <p className="text-gray-400 text-sm mb-4">
                  Aún no hay reseñas demo cargadas.
                </p>
                <SeedDemoButton clientId={client.id} hasReviews={false} />
              </>
            ) : (
              <p className="text-gray-400 text-sm">
                No hay reseñas todavía. Conecta Google My Business para empezar.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((review) => {
              const response = Array.isArray(review.responses) ? review.responses[0] : null
              return (
                <div key={review.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{review.author_name}</span>
                        <span className="text-xs text-gray-400">
                          {'⭐'.repeat(review.rating)} {review.rating}/5
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[review.status]}`}>
                          {STATUS_LABELS[review.status]}
                        </span>
                        {review.published_at && (
                          <span className="text-xs text-gray-400">
                            {new Date(review.published_at).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                      {review.text && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-3">{review.text}</p>
                      )}
                      {response?.final ? (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-2 text-xs text-green-800">
                          <span className="font-semibold">Respuesta publicada: </span>
                          {response.final}
                        </div>
                      ) : response?.draft ? (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-xs text-amber-800">
                          <span className="font-semibold">Borrador IA: </span>
                          {response.draft}
                        </div>
                      ) : null}
                    </div>
                    {review.status === 'pending' && (
                      <ForceGenerateButton reviewId={review.id} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label, value, highlight
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-amber-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
