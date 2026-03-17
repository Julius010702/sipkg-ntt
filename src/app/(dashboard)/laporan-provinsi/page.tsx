'use client'
// src/app/(dashboard)/laporan-provinsi/page.tsx
import { useState, useEffect } from 'react'
import {
  Card, CardHeader, CardBody, Button, Table, Th, Td,
  Badge, Select, Spinner
} from '@/components/ui'
import { Printer, FileBarChart } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Image from 'next/image'

export default function LaporanProvinsiPage() {
  const [laporan, setLaporan] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tahunAjaran, setTahunAjaran] = useState('')
  const [jenisSekolah, setJenisSekolah] = useState('')

  useEffect(() => {
    fetch('/api/pengaturan-sistem?kunci=TAHUN_AKTIF')
      .then(r => r.json())
      .then(j => setTahunAjaran(j.data?.nilai ?? ''))
  }, [])

  const fetchLaporan = async () => {
    if (!tahunAjaran) return
    setLoading(true)
    const params = new URLSearchParams({ tahunAjaran })
    if (jenisSekolah) params.set('jenisSekolah', jenisSekolah)
    const res = await fetch(`/api/laporan/provinsi?${params}`)
    const json = await res.json()
    setLaporan(json)
    setLoading(false)
  }

  useEffect(() => { if (tahunAjaran) fetchLaporan() }, [tahunAjaran])

  const handlePrint = () => window.print()

  const chartData = (laporan?.rekapKabupaten ?? [])
    .filter((k: any) => k.totalGuruDibutuhkan > 0)
    .slice(0, 10)
    .map((k: any) => ({
      name: k.kabupaten.nama.replace('Kabupaten ', '').replace('Kota ', ''),
      dibutuhkan: k.totalGuruDibutuhkan,
      ada: k.totalGuruAda,
      kekurangan: k.totalKekurangan,
    }))

  // Helper: total rekap kabupaten
  const totalKab = (field: string) =>
    (laporan?.rekapKabupaten ?? []).reduce((s: number, k: any) => s + (k[field] ?? 0), 0)

  return (
    <div className="space-y-5">

      {/* ── Toolbar (tidak ikut cetak) ──────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3 print:hidden">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran</label>
          <input
            value={tahunAjaran}
            onChange={e => setTahunAjaran(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
          />
        </div>
        <div>
          <Select
            label="Jenis Sekolah"
            value={jenisSekolah}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setJenisSekolah(e.target.value)}
            options={[
              { value: 'SMA', label: 'SMA' },
              { value: 'SMK', label: 'SMK' },
              { value: 'SLB', label: 'SLB' },
            ]}
            placeholder="Semua Jenis"
          />
        </div>
        <Button onClick={fetchLaporan} loading={loading}>
          <FileBarChart size={16} /> Tampilkan Laporan
        </Button>
        {laporan && (
          <Button variant="outline" onClick={handlePrint}>
            <Printer size={16} /> Cetak
          </Button>
        )}
      </div>

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {laporan && !loading && (
        <div id="print-area" className="space-y-6">

          {/* ── Kop Surat Resmi ───────────────────────────────────────────── */}
          <Card>
            <CardBody className="pb-0">
              {/* Baris kop: logo kiri — teks tengah — (ruang kosong kanan untuk simetri) */}
              <div className="flex items-center gap-4 pb-3 border-b-[3px] border-gray-800">

                {/* Logo NTT */}
                <div className="flex-shrink-0">
                  <Image
                    src="/logo-ntt.png"
                    alt="Lambang Provinsi NTT"
                    width={80}
                    height={90}
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Teks kop — tengah */}
                <div className="flex-1 text-center">
                  <p className="text-[13px] font-bold uppercase tracking-wide leading-snug">
                    Pemerintah Provinsi Nusa Tenggara Timur
                  </p>
                  <p className="text-[12px] font-semibold uppercase tracking-wide leading-snug">
                    Biro Organisasi Sekretariat Daerah Provinsi NTT
                  </p>
                  <p className="text-[11px] text-gray-600 leading-snug mt-0.5">
                    Jl. El Tari No. 1, Kupang — Nusa Tenggara Timur 85111
                  </p>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    Telp. (0380) 821498 · Fax. (0380) 821498
                  </p>
                </div>

                {/* Spacer kanan untuk keseimbangan visual */}
                <div className="flex-shrink-0 w-[80px]" />
              </div>

              {/* Judul laporan */}
              <div className="text-center py-4">
                <h2 className="text-[15px] font-bold uppercase tracking-wider text-gray-900">
                  Rekap Kebutuhan Guru Provinsi NTT
                </h2>
                <div className="w-48 h-0.5 bg-gray-800 mx-auto mt-1 mb-2" />
                <p className="text-[12px] text-gray-600">
                  Tahun Ajaran <span className="font-semibold">{laporan.tahunAjaran}</span>
                  {laporan.jenisSekolah !== 'SEMUA'
                    ? ` · Jenis Sekolah: ${laporan.jenisSekolah}`
                    : ' · Semua Jenis Sekolah'}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* ── Grafik (tidak ikut cetak) ─────────────────────────────────── */}
          {chartData.length > 0 && (
            <Card className="print:hidden">
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-900">
                  Grafik Kebutuhan Guru per Kabupaten/Kota
                </h3>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="dibutuhkan" name="Dibutuhkan" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="ada"         name="Ada"         fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="kekurangan"  name="Kekurangan"  fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          )}

          {/* ── Tabel I: Rekap per Kabupaten/Kota ────────────────────────── */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">I. Rekap per Kabupaten/Kota</h3>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>No</Th>
                  <Th>Kabupaten/Kota</Th>
                  <Th className="text-center">Total Sekolah</Th>
                  <Th className="text-center">Sudah Hitung</Th>
                  <Th className="text-center">Guru Ada</Th>
                  <Th className="text-center">Dibutuhkan</Th>
                  <Th className="text-center">Kekurangan</Th>
                  <Th className="text-center">Kelebihan</Th>
                </tr>
              </thead>
              <tbody>
                {(laporan.rekapKabupaten ?? []).map((k: any, idx: number) => (
                  <tr key={k.kabupaten.id} className="hover:bg-gray-50">
                    <Td>{idx + 1}</Td>
                    <Td className="font-medium text-gray-900">{k.kabupaten.nama}</Td>
                    <Td className="text-center">{k.totalSekolah}</Td>
                    <Td className="text-center">
                      <span className={k.sekolahSudahHitung < k.totalSekolah ? 'text-yellow-600 font-semibold' : 'text-green-600 font-semibold'}>
                        {k.sekolahSudahHitung}
                      </span>
                      <span className="text-gray-400 text-xs"> / {k.totalSekolah}</span>
                    </Td>
                    <Td className="text-center">{k.totalGuruAda}</Td>
                    <Td className="text-center font-semibold text-blue-700">{k.totalGuruDibutuhkan}</Td>
                    <Td className="text-center font-bold text-red-600">{k.totalKekurangan}</Td>
                    <Td className="text-center font-bold text-yellow-600">{k.totalKelebihan}</Td>
                  </tr>
                ))}

                {/* Baris total — FIX: gunakan <td> native bukan <Td> agar colSpan bisa dipakai */}
                <tr className="bg-blue-50 font-bold">
                  <td colSpan={2} className="px-4 py-2 text-right font-bold text-blue-900 text-sm">
                    TOTAL PROVINSI
                  </td>
                  <td className="px-4 py-2 text-center text-blue-900 text-sm">{totalKab('totalSekolah')}</td>
                  <td className="px-4 py-2 text-center text-blue-900 text-sm">{totalKab('sekolahSudahHitung')}</td>
                  <td className="px-4 py-2 text-center text-blue-900 text-sm">{totalKab('totalGuruAda')}</td>
                  <td className="px-4 py-2 text-center text-blue-900 text-sm">{totalKab('totalGuruDibutuhkan')}</td>
                  <td className="px-4 py-2 text-center text-red-700 font-bold text-sm">{totalKab('totalKekurangan')}</td>
                  <td className="px-4 py-2 text-center text-yellow-700 font-bold text-sm">{totalKab('totalKelebihan')}</td>
                </tr>
              </tbody>
            </Table>
          </Card>

          {/* ── Tabel II: Rekap per Mata Pelajaran ───────────────────────── */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">
                II. Rekap Kebutuhan Guru per Mata Pelajaran
              </h3>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>No</Th>
                  <Th>Mata Pelajaran</Th>
                  <Th className="text-center">Guru Dibutuhkan</Th>
                  <Th className="text-center">Guru Ada</Th>
                  <Th className="text-center">Kekurangan</Th>
                  <Th className="text-center">Kelebihan</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {(laporan.rekapMapel ?? [])
                  .sort((a: any, b: any) => b.kekurangan - a.kekurangan)
                  .map((m: any, idx: number) => (
                    <tr key={m.mataPelajaran?.id ?? idx} className="hover:bg-gray-50">
                      <Td>{idx + 1}</Td>
                      <Td className="font-medium text-gray-900">{m.mataPelajaran?.nama ?? '-'}</Td>
                      <Td className="text-center font-semibold text-blue-700">{m.jumlahGuruDibutuhkan ?? 0}</Td>
                      <Td className="text-center">{m.jumlahGuruAda ?? 0}</Td>
                      <Td className="text-center font-bold text-red-600">{m.kekurangan ?? 0}</Td>
                      <Td className="text-center font-bold text-yellow-600">{m.kelebihan ?? 0}</Td>
                      <Td>
                        {(m.kekurangan ?? 0) > 0 ? (
                          <Badge color="red">Kurang {m.kekurangan}</Badge>
                        ) : (m.kelebihan ?? 0) > 0 ? (
                          <Badge color="yellow">Lebih {m.kelebihan}</Badge>
                        ) : (
                          <Badge color="green">Cukup</Badge>
                        )}
                      </Td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Card>

          {/* ── Tanda Tangan ──────────────────────────────────────────────── */}
          <Card>
            <CardBody>
              <div className="flex justify-between items-start px-4 mt-2">
                <div className="text-sm text-center w-52">
                  <p>Mengetahui,</p>
                  <p className="mt-1 font-medium">Kepala Biro Organisasi</p>
                  <p className="font-medium">Setda Provinsi NTT</p>
                  <div className="h-16" />
                  <p className="font-semibold border-t border-gray-400 pt-1">________________________</p>
                  <p className="text-gray-500 text-xs mt-0.5">NIP. ________________________</p>
                </div>
                <div className="text-sm text-center w-52">
                  <p>Kupang, {new Date().toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}</p>
                  <p className="mt-1 font-medium">Penyusun,</p>
                  <p className="text-gray-400 text-xs">&nbsp;</p>
                  <div className="h-16" />
                  <p className="font-semibold border-t border-gray-400 pt-1">________________________</p>
                  <p className="text-gray-500 text-xs mt-0.5">NIP. ________________________</p>
                </div>
              </div>
            </CardBody>
          </Card>

        </div>
      )}

      {/* ── Print styles ─────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
          @page { margin: 1.5cm 2cm; }
        }
      `}</style>
    </div>
  )
}