'use client'

export default function ConnectGoogleButton({
  clientId,
  connected,
}: {
  clientId: string
  connected: boolean
}) {
  if (connected) {
    return (
      <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">
        ✓ Google conectado
      </span>
    )
  }

  return (
    <a
      href={`/api/auth/google?clientId=${clientId}`}
      className="text-xs font-semibold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
    >
      Conectar Google My Business
    </a>
  )
}
