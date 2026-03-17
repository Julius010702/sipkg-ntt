'use client'
// src/app/(dashboard)/perhitungan/page.tsx
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Card, CardHeader, CardBody, Button, Table, Th, Td,
  Badge, Alert, StatCard, Spinner
} from '@/components/ui'
import { Calculator, RefreshCw, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'

export default function PerhitunganPage() {
  const { data: session } = useSession()
  const [pengaturan, setPengaturan] = useState<any>(null)
  const [hasil, setHasil] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const sekolahId = (session?.user as any)?.sekolahId

  useEffect(() => {
    fetch('/api/pengaturan-sistem?kunci=TAHUN_AKTIF')
      .then(r => r.json())
      .then(j => setPengaturan(j.data))
      .finally(() => setLoadingData(false))
  }, [])

  useEffect(() => {
    if (sekolahId && pengaturan) {
      fetch(`/api/kebutuhan-guru?sekolahId=${sekolahId}&tahunAjaran=${encodeURIComponent(pengaturan.nilai)}`)
        .then(r => r.json())
        .then(j => setHasil(j.data))
    }
  }, [sekolahId, pengaturan])

  const handleHitung = async () => {
    if (!sekolahId || !pengaturan) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/kebutuhan-guru/hitung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sekolahId, tahunAjaran: pengaturan.nilai }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: json.error || 'Perhitungan gagal' })
        return
      }
      setHasil(json.data)
      setMessage({ type: 'success', text: 'Perhitungan kebutuhan guru berhasil dilakukan!' })
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <div className="flex justify-center py-12"><Spinner /></div>

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <Card>
        <CardBody className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calculator size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Perhitungan Kebutuhan Guru</h2>
              <p className="text-sm text-gray-500">Tahun Ajaran: <strong>{pengaturan?.nilai ?? '-'}</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasil?.statusHitung && (
              <Badge color="green">
                <CheckCircle size={12} className="mr-1" />
                Sudah Dihitung
              </Badge>
            )}
            <Button onClick={handleHitung} loading={loading}>
              <RefreshCw size={16} />
              {hasil?.statusHitung ? 'Hitung Ulang' : 'Hitung Sekarang'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {message && <Alert type={message.type} message={message.text} />}

      {/* Info Rumus */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-900">📐 Rumus Perhitungan</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="font-medium text-blue-800">Total Jam Dibutuhkan</p>
              <p className="text-blue-600 font-mono text-xs mt-1">= Jml Rombel × Jam/Minggu</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="font-medium text-green-800">Guru Dibutuhkan</p>
              <p className="text-green-600 font-mono text-xs mt-1">= CEILING(Total Jam ÷ 24)</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="font-medium text-orange-800">Kekurangan / Kelebihan</p>
              <p className="text-orange-600 font-mono text-xs mt-1">= Dibutuhkan − Guru Ada</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            * Jam mengajar wajib per guru: 24 jam tatap muka/minggu (Permendikbud No. 15 Tahun 2018)
          </p>
        </CardBody>
      </Card>

      {/* Hasil Perhitungan */}
      {hasil && (
        <>
          {/* Ringkasan */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Guru Ada" value={hasil.totalGuruAda ?? hasil.totalGuruAda} icon={<CheckCircle size={22} />} color="blue" />
            <StatCard label="Guru Dibutuhkan" value={hasil.totalGuruDibutuhkan} icon={<TrendingUp size={22} />} color="green" />
            <StatCard
              label="Kekurangan"
              value={hasil.totalKekurangan}
              icon={<AlertTriangle size={22} />}
              color={hasil.totalKekurangan > 0 ? 'red' : 'green'}
            />
            <StatCard
              label="Kelebihan"
              value={hasil.totalKelebihan}
              icon={<TrendingUp size={22} />}
              color={hasil.totalKelebihan > 0 ? 'yellow' : 'green'}
            />
          </div>

          {/* Detail per Mata Pelajaran */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Detail per Mata Pelajaran</h3>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>No</Th>
                  <Th>Mata Pelajaran</Th>
                  <Th className="text-center">Jml Rombel</Th>
                  <Th className="text-center">Jam/Minggu</Th>
                  <Th className="text-center">Total Jam</Th>
                  <Th className="text-center">Dibutuhkan</Th>
                  <Th className="text-center">Ada</Th>
                  <Th className="text-center">Selisih</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {(hasil.detail ?? []).map((d: any, idx: number) => {
                  const selisih = d.jumlahGuruAda - d.jumlahGuruDibutuhkan
                  return (
                    <tr key={d.mataPelajaranId} className="hover:bg-gray-50">
                      <Td className="text-gray-400">{idx + 1}</Td>
                      <Td className="font-medium">{d.namaMapel ?? d.mataPelajaran?.nama}</Td>
                      <Td className="text-center">{d.jumlahRombel}</Td>
                      <Td className="text-center">{d.jamPerMinggu}</Td>
                      <Td className="text-center">{d.totalJamDibutuhkan}</Td>
                      <Td className="text-center font-semibold text-blue-700">{d.jumlahGuruDibutuhkan}</Td>
                      <Td className="text-center font-semibold">{d.jumlahGuruAda}</Td>
                      <Td className={`text-center font-bold ${selisih < 0 ? 'text-red-600' : selisih > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {selisih > 0 ? `+${selisih}` : selisih}
                      </Td>
                      <Td>
                        {selisih < 0 ? (
                          <Badge color="red">Kurang {Math.abs(selisih)}</Badge>
                        ) : selisih > 0 ? (
                          <Badge color="yellow">Lebih {selisih}</Badge>
                        ) : (
                          <Badge color="green">Cukup</Badge>
                        )}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </Card>
        </>
      )}

      {!hasil && !loading && (
        <Card>
          <CardBody>
            <div className="text-center py-8 text-gray-400">
              <Calculator size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Klik tombol <strong>Hitung Sekarang</strong> untuk menjalankan kalkulasi kebutuhan guru.</p>
              <p className="text-xs mt-1">Pastikan data rombongan belajar sudah diinput terlebih dahulu.</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
