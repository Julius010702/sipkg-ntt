// src/app/(dashboard)/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-gray-200 rounded-lg" />
            <div className="h-3 w-32 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-9 w-32 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-6 w-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-50">
            <div className="h-4 w-6 bg-gray-100 rounded" />
            <div className="h-4 flex-1 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
