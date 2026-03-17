'use client'
// src/app/(dashboard)/anjab/[id]/page.tsx
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Card, CardHeader, CardBody, Button,
  Modal, Input, Spinner, Alert
} from '@/components/ui'
import { Plus, ArrowLeft, Calculator, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'

const WAKTU_EFEKTIF = 75000

export default function AnjabDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [anjab, setAnjab]         = useState<any>(null)
  const [abkList, setAbkList]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [modalAbk, setModalAbk]   = useState(false)
  const [editAbkId, setEditAbkId] = useState<string | null>(null)
  const [deleteAbkId, setDeleteAbkId] = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [preview, setPreview]     = useState<{ pegawaiDibutuhkan: number; kekurangan: number; kelebihan: number } | null>(null)

  const { register, handleSubmit, reset, watch } = useForm()
  const watchVolume     = watch('volumeBebanKerja')
  const watchNorma      = watch('normaWaktu')
  const watchPegawaiAda = watch('pegawaiAda')

  useEffect(() => {
    const v = parseInt(watchVolume  ?? 0)
    const n = parseInt(watchNorma   ?? 0)
    const p = parseInt(watchPegawaiAda ?? 0)
    if (v > 0 && n > 0) {
      const waktu      = v * n
      const dibutuhkan = waktu / WAKTU_EFEKTIF
      const kekurangan = Math.max(0, Math.ceil(dibutuhkan) - p)
      const kelebihan  = Math.max(0, p - Math.ceil(dibutuhkan))
      setPreview({ pegawaiDibutuhkan: dibutuhkan, kekurangan, kelebihan })
    } else {
      setPreview(null)
    }
  }, [watchVolume, watchNorma, watchPegawaiAda])

  const fetchData = async () => {
    setLoading(true)
    const [anjabRes, abkRes] = await Promise.all([
      fetch(`/api/anjab/${id}`),
      fetch(`/api/anjab/${id}/abk`),
    ])
    const anjabJson = await anjabRes.json()
    const abkJson   = await abkRes.json()
    setAnjab(anjabJson.data)
    setAbkList(abkJson.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const openAddAbk = () => {
    reset({ tahun: new Date().getFullYear(), namaJabatan: anjab?.namaJabatan ?? '' })
    setEditAbkId(null)
    setModalAbk(true)
    setError('')
    setPreview(null)
  }

  const openEditAbk = (item: any) => {
    reset({
      namaJabatan: item.namaJabatan,
      tahun: item.tahun,
      volumeBebanKerja: item.volumeBebanKerja,
      normaWaktu: item.normaWaktu,
      pegawaiAda: item.pegawaiAda,
    })
    setEditAbkId(item.id)
    setModalAbk(true)
    setError('')
  }

  const onSubmitAbk = async (formData: any) => {
    setSaving(true); setError('')
    try {
      const url    = editAbkId ? `/api/anjab/${id}/abk/${editAbkId}` : `/api/anjab/${id}/abk`
      const method = editAbkId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tahun:            parseInt(formData.tahun),
          volumeBebanKerja: parseInt(formData.volumeBebanKerja),
          normaWaktu:       parseInt(formData.normaWaktu),
          pegawaiAda:       parseInt(formData.pegawaiAda ?? 0),
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Gagal menyimpan'); return }
      setModalAbk(false)
      fetchData()
    } finally { setSaving(false) }
  }

  const handleDeleteAbk = async () => {
    if (!deleteAbkId) return
    await fetch(`/api/anjab/${id}/abk/${deleteAbkId}`, { method: 'DELETE' })
    setDeleteAbkId(null)
    fetchData()
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!anjab)  return <Alert type="error" message="Data ANJAB tidak ditemukan" />

  const totalDibutuhkan = abkList.reduce((s, a) => s + Math.ceil(Number(a.pegawaiDibutuhkan)), 0)
  const totalAda        = abkList.reduce((s, a) => s + a.pegawaiAda, 0)
  const totalKekurangan = abkList.reduce((s, a) => s + a.kekurangan, 0)
  const totalKelebihan  = abkList.reduce((s, a) => s + a.kelebihan, 0)

  return (
    <div className="space-y-5">
      <Link href="/anjab" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
        <ArrowLeft size={16} /> Kembali ke ANJAB
      </Link>

      {/* Header */}
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{anjab.namaJabatan}</h2>
              {/* FIX: ganti Badge + className → span biasa */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                {anjab.tahun}
              </span>
              {anjab.kodeJabatan && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {anjab.kodeJabatan}
                </span>
              )}
              {anjab.ikhtisar && (
                <p className="text-sm text-gray-600 mt-2 max-w-2xl">{anjab.ikhtisar}</p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Detail ANJAB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Tugas Pokok',        value: anjab.tugasPokok },
          { label: 'Hasil Kerja',        value: anjab.hasilKerja },
          { label: 'Tanggung Jawab',     value: anjab.tanggungjawab },
          { label: 'Wewenang',           value: anjab.wewenang },
          { label: 'Kualifikasi Jabatan',value: anjab.kualifikasi },
          { label: 'Syarat Jabatan',     value: anjab.syaratJabatan },
        ].filter(d => d.value).map(d => (
          <Card key={d.label}>
            <CardHeader>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{d.label}</h4>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-sm text-gray-700 whitespace-pre-line">{d.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ABK */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-blue-600" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Analisis Beban Kerja (ABK)</h3>
                <p className="text-xs text-gray-500">
                  Waktu efektif: {(WAKTU_EFEKTIF / 60).toLocaleString('id-ID')} jam/tahun (75.000 menit)
                </p>
              </div>
            </div>
            <Button onClick={openAddAbk}><Plus size={16} /> Tambah ABK</Button>
          </div>
        </CardHeader>

        {abkList.length === 0 ? (
          <CardBody>
            <p className="text-sm text-gray-400 text-center py-6">
              Belum ada data ABK. Klik "Tambah ABK" untuk memulai.
            </p>
          </CardBody>
        ) : (
          <>
            {/* FIX: Pakai native <table> karena Td tidak support colSpan */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {['No','Nama Jabatan','Tahun','Volume','Norma Waktu (mnt)','Waktu Penyelesaian','Pegawai Dibutuhkan','Pegawai Ada','Kekurangan','Kelebihan','Aksi'].map(h => (
                      <th key={h} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap first:text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {abkList.map((item, idx) => {
                    const dibutuhkan = Math.ceil(Number(item.pegawaiDibutuhkan))
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-3 py-3 font-medium text-gray-900">{item.namaJabatan}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium">{item.tahun}</span>
                        </td>
                        <td className="px-3 py-3 text-center">{item.volumeBebanKerja.toLocaleString('id-ID')}</td>
                        <td className="px-3 py-3 text-center">{item.normaWaktu.toLocaleString('id-ID')}</td>
                        <td className="px-3 py-3 text-center">{item.waktePenyelesaian.toLocaleString('id-ID')}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-semibold text-blue-700">{Number(item.pegawaiDibutuhkan).toFixed(2)}</span>
                          <span className="block text-[11px] text-gray-400">({dibutuhkan} org)</span>
                        </td>
                        <td className="px-3 py-3 text-center">{item.pegawaiAda}</td>
                        <td className={`px-3 py-3 text-center font-bold ${item.kekurangan > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {item.kekurangan}
                        </td>
                        <td className={`px-3 py-3 text-center font-bold ${item.kelebihan > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                          {item.kelebihan}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => openEditAbk(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil size={14}/></button>
                            <button onClick={() => setDeleteAbkId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {/* FIX: Total row — pakai <td colSpan> native, bukan <Td colSpan> */}
                  <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                    <td colSpan={6} className="px-3 py-3 text-right text-blue-900 text-sm">TOTAL</td>
                    <td className="px-3 py-3 text-center text-blue-900">{totalDibutuhkan} org</td>
                    <td className="px-3 py-3 text-center text-blue-900">{totalAda}</td>
                    <td className="px-3 py-3 text-center text-red-700">{totalKekurangan}</td>
                    <td className="px-3 py-3 text-center text-yellow-700">{totalKelebihan}</td>
                    <td className="px-3 py-3">{/* FIX: empty cell pakai &nbsp; */}&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Kesimpulan */}
            <CardBody className="border-t border-gray-100">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"/>
                  <span className="text-gray-600">Dibutuhkan: <strong className="text-blue-700">{totalDibutuhkan} orang</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block"/>
                  <span className="text-gray-600">Ada: <strong>{totalAda} orang</strong></span>
                </div>
                {totalKekurangan > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>
                    <span className="text-gray-600">Kekurangan: <strong className="text-red-600">{totalKekurangan} orang</strong></span>
                  </div>
                )}
                {totalKelebihan > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"/>
                    <span className="text-gray-600">Kelebihan: <strong className="text-yellow-600">{totalKelebihan} orang</strong></span>
                  </div>
                )}
              </div>
            </CardBody>
          </>
        )}
      </Card>

      {/* Modal ABK */}
      <Modal open={modalAbk} onClose={() => setModalAbk(false)} title={editAbkId ? 'Edit ABK' : 'Tambah ABK'} size="md">
        <form onSubmit={handleSubmit(onSubmitAbk)} className="space-y-4">
          {error && <Alert type="error" message={error} />}
          <Input label="Nama Jabatan *" placeholder="Nama jabatan" {...register('namaJabatan', { required: true })} />
          <Input label="Tahun *" type="number" min="2020" max="2030" {...register('tahun', { required: true })} />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Volume Beban Kerja *"
              type="number" min="0"
              placeholder="Jumlah kegiatan/output"
              hint="Jumlah output yang dihasilkan per tahun"
              {...register('volumeBebanKerja', { required: true, min: 1 })}
            />
            <Input
              label="Norma Waktu (menit) *"
              type="number" min="0"
              placeholder="Menit per kegiatan"
              hint="Waktu yang dibutuhkan per output (menit)"
              {...register('normaWaktu', { required: true, min: 1 })}
            />
          </div>
          <Input label="Pegawai yang Ada" type="number" min="0" defaultValue={0} {...register('pegawaiAda')} />

          {preview && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-2 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Preview Kalkulasi</p>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <p className="text-blue-800 font-bold text-lg">{preview.pegawaiDibutuhkan.toFixed(2)}</p>
                  <p className="text-xs text-blue-600">Pegawai Dibutuhkan</p>
                </div>
                <div>
                  <p className={`font-bold text-lg ${preview.kekurangan > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {preview.kekurangan}
                  </p>
                  <p className="text-xs text-gray-500">Kekurangan</p>
                </div>
                <div>
                  <p className={`font-bold text-lg ${preview.kelebihan > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {preview.kelebihan}
                  </p>
                  <p className="text-xs text-gray-500">Kelebihan</p>
                </div>
              </div>
              <p className="text-xs text-blue-500 text-center">
                Waktu Penyelesaian: {(parseInt(watchVolume || 0) * parseInt(watchNorma || 0)).toLocaleString('id-ID')} menit
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalAbk(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan ABK</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus ABK */}
      <Modal open={!!deleteAbkId} onClose={() => setDeleteAbkId(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-sm text-gray-600 mb-4">Yakin ingin menghapus data ABK ini?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteAbkId(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDeleteAbk}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}