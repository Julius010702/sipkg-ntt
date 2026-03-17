// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🔍</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 text-sm mb-6">
          Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
