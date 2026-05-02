'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      business_name: (form.elements.namedItem('business_name') as HTMLInputElement).value,
      whatsapp_number: (form.elements.namedItem('whatsapp_number') as HTMLInputElement).value,
      google_place_id: (form.elements.namedItem('google_place_id') as HTMLInputElement).value,
      tone_instructions: (form.elements.namedItem('tone_instructions') as HTMLTextAreaElement).value,
    }

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? 'Error creando cliente')
      setLoading(false)
      return
    }

    const client = await res.json()
    router.push(`/dashboard/clients/${client.id}`)
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <a href="/dashboard" className="text-sm text-blue-600 hover:underline">← Volver</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nuevo cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <Field label="Nombre del contacto" name="name" required placeholder="Ej: María García" />
        <Field label="Nombre del negocio" name="business_name" required placeholder="Ej: Hotel Mirador Málaga" />
        <Field label="WhatsApp (con prefijo +34)" name="whatsapp_number" required placeholder="+34 612 345 678" />
        <Field label="Google Place ID" name="google_place_id" required placeholder="ChIJ..." />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instrucciones de tono
          </label>
          <textarea
            name="tone_instructions"
            rows={3}
            defaultValue="tono cercano y profesional, responde siempre en español"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            El sistema de IA usará estas instrucciones al generar respuestas.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Creando…' : 'Crear cliente'}
          </button>
          <a
            href="/dashboard"
            className="px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}

function Field({
  label, name, required, placeholder
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
