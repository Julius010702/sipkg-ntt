'use client'
// src/app/(dashboard)/monitoring/page.tsx
import { useState, useEffect } from 'react'
import {
  Card, CardHeader, CardBody, Table, Th, Td,
  Badge, Select, Spinner, StatCard, EmptyState
} from '@/components/ui'
import { Activity, AlertTriangle, CheckCircle, School, Clock } from 'lucide-react'

export default function MonitoringPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tahunAjaran, setTahunAjaran] = useState('')
  const [jenisSekolah, setJenisSekolah] = useState('')
  const [kabupatenId, setKabupatenId] = useState('')
  const [kabupatenList, setKabupatenList] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/pengaturan-sistem?kunci=TAHUN_AKTIF')
      .then(r => r.json())
      .then(j => setTahunAjaran(j.data?.nilai ?? ''))
    fetch('/api/kabupaten')
      .then(r => r.json())
      .then(j => setKabupatenList(j.data ?? []))
  }, [])

  useEffect(() => {
    if (!tahunAjaran) return
    setLoading(true)
    const params = new URLSearchParams({ tahunAjaran })
    if (jenisSekolah) params.set('jenisSekolah', jenisSekolah)
    if (kabupatenId) params.set('kabupatenId', kabupatenId)
    fetch(`/api/monitoring?${params}`)
      .then(r => r.json())
      .then(j => setData(j))
      .finally(() => setLoading(false))
  }, [tahunAjaran, jenisSekolah, kabupatenId])

  const stats = data?.stats

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran</label>
              <input
                value={tahunAjaran}
                onChange={e => setTahunAjaran(e.target.value)}
                placeholder="2024/2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-40">
              <Select
                label="Jenis Sekolah"
                value={jenisSekolah}
                onChange={e => setJenisSekolah(e.target.value)}
                options={[
                  { value: 'SMA', label: 'SMA' },
                  { value: 'SMK', label: 'SMK' },
                  { value: 'SLB', label: 'SLB' },
                ]}
                placeholder="Semua Jenis"
              />
            </div>
            <div className="w-52">
              <Select
                label="Kabupaten/Kota"
                value={kabupatenId}
                onChange={e => setKabupatenId(e.target.value)}
                options={kabupatenList.map(k => ({ value: k.id, label: k.nama }))}
                placeholder="Semua Kabupaten"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Statistik */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Sudah Hitung" value={stats.totalSekolahDenganData} icon={<CheckCircle size={20} />} color="green" />
              <StatCard label="Belum Hitung" value={stats.totalSekolahBelumHitung} icon={<Clock size={20} />} color="yellow" />
              <StatCard label="Guru Ada" value={stats.totalGuruAda} icon={<Activity size={20} />} color="blue" />
              <StatCard label="Dibutuhkan" value={stats.totalGuruDibutuhkan} icon={<Activity size={20} />} color="purple" />
              <StatCard label="Kekurangan" value={stats.totalKekurangan} icon={<AlertTriangle size={20} />} color={stats.totalKekurangan > 0 ? 'red' : 'green'} />
              <StatCard label="Kelebihan" value={stats.totalKelebihan} icon={<Activity size={20} />} color="yellow" />
            </div>
          )}

          {/* Tabel Rekap per Sekolah */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">
                Rekap Kebutuhan Guru per Sekolah — Tahun Ajaran {tahunAjaran}
              </h3>
            </CardHeader>
            {(data?.data ?? []).length === 0 ? (
              <EmptyState message="Belum ada data perhitungan untuk filter ini" icon={<School size={40} />} />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>No</Th>
                    <Th>Sekolah</Th>
                    <Th>Kabupaten</Th>
                    <Th>Jenis</Th>
                    <Th className="text-center">Guru Ada</Th>
                    <Th className="text-center">Dibutuhkan</Th>
                    <Th className="text-center">Kekurangan</Th>
                    <Th className="text-center">Kelebihan</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.data ?? []).map((item: any, idx: number) => {
                    const net = item.totalGuruAda - item.totalGuruDibutuhkan
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <Td className="text-gray-400">{idx + 1}</Td>
                        <Td className="font-medium text-gray-900">{item.sekolah.nama}</Td>
                        <Td className="text-gray-500 text-xs">{item.sekolah.kabupaten?.nama}</Td>
                        <Td>
                          <Badge color={item.sekolah.jenisSekolah === 'SMA' ? 'blue' : item.sekolah.jenisSekolah === 'SMK' ? 'green' : 'purple'}>
                            {item.sekolah.jenisSekolah}
                          </Badge>
                        </Td>
                        <Td className="text-center">{item.totalGuruAda}</Td>
                        <Td className="text-center font-semibold text-blue-700">{item.totalGuruDibutuhkan}</Td>
                        <Td className="text-center font-bold text-red-600">{item.totalKekurangan}</Td>
                        <Td className="text-center font-bold text-yellow-600">{item.totalKelebihan}</Td>
                        <Td>
                          {item.totalKekurangan > 0 ? (
                            <Badge color="red">Kurang {item.totalKekurangan}</Badge>
                          ) : item.totalKelebihan > 0 ? (
                            <Badge color="yellow">Lebih {item.totalKelebihan}</Badge>
                          ) : (
                            <Badge color="green">Cukup</Badge>
                          )}
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            )}
          </Card>

          {/* Sekolah Belum Hitung */}
          {(data?.belumHitung ?? []).length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                  <Clock size={16} />
                  Sekolah Belum Melakukan Perhitungan ({data.belumHitung.length})
                </h3>
              </CardHeader>
              <Table>
                <thead>
                  <tr>
                    <Th>No</Th>
                    <Th>Nama Sekolah</Th>
                    <Th>NPSN</Th>
                    <Th>Kabupaten</Th>
                    <Th>Jenis</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.belumHitung.map((s: any, idx: number) => (
                    <tr key={s.id} className="hover:bg-orange-50">
                      <Td className="text-gray-400">{idx + 1}</Td>
                      <Td className="font-medium text-gray-900">{s.nama}</Td>
                      <Td className="text-gray-500">{s.npsn}</Td>
                      <Td className="text-gray-500">{s.kabupaten?.nama}</Td>
                      <Td><Badge color="gray">{s.jenisSekolah}</Badge></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
