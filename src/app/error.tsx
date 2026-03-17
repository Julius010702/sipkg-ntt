'use client'
// src/app/error.tsx
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h1>
        <p className="text-gray-500 text-sm mb-6">
          Maaf, terjadi kesalahan yang tidak terduga. Tim teknis telah diberitahu.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Coba Lagi
          </button>
          <a
            href="/dashboard"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
