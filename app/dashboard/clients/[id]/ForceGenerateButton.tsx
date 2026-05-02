'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForceGenerateButton({ reviewId }: { reviewId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    await fetch(`/api/reviews/${reviewId}/generate`, { method: 'POST' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-50 whitespace-nowrap transition"
    >
      {loading ? 'Generando…' : '↺ Regenerar'}
    </button>
  )
}
