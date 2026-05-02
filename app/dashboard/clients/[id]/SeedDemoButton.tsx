'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SeedDemoButton({
  clientId,
  hasReviews,
}: {
  clientId: string
  hasReviews: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    await fetch(`/api/demo/seed/${clientId}`, { method: 'POST' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 ${
        hasReviews
          ? 'text-violet-700 bg-white border border-violet-300 hover:bg-violet-50'
          : 'text-white bg-violet-600 hover:bg-violet-700'
      }`}
    >
      {loading
        ? 'Cargando…'
        : hasReviews
        ? '↺ Reiniciar datos demo'
        : '✦ Cargar 10 reseñas demo'}
    </button>
  )
}
