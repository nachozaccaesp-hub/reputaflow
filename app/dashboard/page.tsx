import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { isDemoClient } from '@/lib/demo-reviews'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServiceClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  const clientsWithStats = await Promise.all(
    (clients ?? []).map(async (client) => {
      const { count: pendingCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .eq('status', 'pending')

      const { data: lastReview } = await supabase
        .from('reviews')
        .select('published_at, rating')
        .eq('client_id', client.id)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { data: ratingData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('client_id', client.id)

      const avgRating = ratingData && ratingData.length > 0
        ? ratingData.reduce((s, r) => s + r.rating, 0) / ratingData.length
        : null

      return { ...client, pendingCount: pendingCount ?? 0, lastReview, avgRating }
    })
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Link
          href="/dashboard/clients/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          + Nuevo cliente
        </Link>
      </div>

      {clientsWithStats.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No hay clientes aún.</p>
          <Link href="/dashboard/clients/new" className="mt-3 inline-block text-blue-600 text-sm font-medium hover:underline">
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Negocio</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Contacto</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Pendientes</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Rating medio</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Última reseña</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody>
              {clientsWithStats.map((client) => (
                <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/clients/${client.id}`} className="font-medium text-blue-600 hover:underline">
                        {client.business_name}
                      </Link>
                      {isDemoClient(client.google_place_id) && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 border border-violet-200">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">{client.name}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{client.whatsapp_number}</td>
                  <td className="px-4 py-3 text-center">
                    {client.pendingCount > 0 ? (
                      <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {client.pendingCount}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {client.avgRating !== null ? (
                      <span className="font-semibold text-gray-800">
                        ⭐ {client.avgRating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {client.lastReview?.published_at
                      ? new Date(client.lastReview.published_at).toLocaleDateString('es-ES')
                      : '—'
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                      client.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {client.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
