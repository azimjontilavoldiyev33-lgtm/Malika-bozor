'use client'

// Root layout'ning o'zi qulaganda ishlaydigan zaxira (o'z <html>/<body>'si bilan).
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="uz">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 48 }}>😕</p>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Nimadir xato ketdi</h1>
        <p style={{ color: '#64748b' }}>
          Iltimos, sahifani yangilang yoki keyinroq qayta urinib ko&apos;ring.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 8,
            borderRadius: 12,
            background: '#4f46e5',
            color: '#fff',
            padding: '10px 20px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Qayta urinish
        </button>
      </body>
    </html>
  )
}
