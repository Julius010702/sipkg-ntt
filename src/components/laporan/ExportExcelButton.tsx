// src/components/laporan/ExportExcelButton.tsx
'use client'
import { Button } from '@/components/ui'
import { Download } from 'lucide-react'
import { useState } from 'react'

interface Props {
  type: 'sekolah' | 'provinsi' | 'guru'
  fetchParams: Record<string, string>
  label?: string
}

export function ExportExcelButton({ type, fetchParams, label = 'Export Excel' }: Props) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      // Dynamically import xlsx and export functions (client-side only)
      const XLSX = await import('xlsx')
      const { exportLaporanSekolah, exportLaporanProvinsi, exportDataGuru } = await import('@/lib/export/excel')

      if (type === 'sekolah') {
        const params = new URLSearchParams(fetchParams)
        const res = await fetch(`/api/laporan/sekolah?${params}`)
        const json = await res.json()
        if (json.sekolah) exportLaporanSekolah(json)
      } else if (type === 'provinsi') {
        const params = new URLSearchParams(fetchParams)
        const res = await fetch(`/api/laporan/provinsi?${params}`)
        const json = await res.json()
        if (json.rekapKabupaten) exportLaporanProvinsi(json)
      } else if (type === 'guru') {
        const params = new URLSearchParams({ ...fetchParams, perPage: '9999' })
        const res = await fetch(`/api/guru?${params}`)
        const json = await res.json()
        if (json.data) exportDataGuru(json.data, fetchParams.namaSekolah ?? 'Sekolah')
      }
    } catch (e) {
      console.error('Export error:', e)
      alert('Gagal mengekspor data. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} loading={loading}>
      <Download size={16} />
      {label}
    </Button>
  )
}
