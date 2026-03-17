'use client'
// src/app/(dashboard)/rombongan-belajar/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  Card, CardHeader, CardBody, Table, Th, Td, Button,
  Badge, Modal, Input, Select, Spinner, EmptyState
} from '@/components/ui'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'

const TINGKAT_OPTIONS = [
  { value: 'X', label: 'Kelas X' },
  { value: 'XI', label: 'Kelas XI' },
  { value: 'XII', label: 'Kelas XII' },
]

export default function RombonganBelajarPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tahunAjaran, setTahunAjaran] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const sekolahId = (session?.user as any)?.sekolahId
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const fetchTahun = async () => {
    const res = await fetch('/api/pengaturan-sistem?kunci=TAHUN_AKTIF')
    const j = await res.json()
    setTahunAjaran(j.data?.nilai ?? '')
  }

  const fetchData = useCallback(async () => {
    if (!tahunAjaran) return
    setLoading(true)
    const params = new URLSearchParams({ tahunAjaran })
    if (sekolahId) params.set('sekolahId', sekolahId)
    const res = await fetch(`/api/rombongan-belajar?${params}`)
    const json = await res.json()
    setData(json.data ?? [])
    setLoading(false)
  }, [tahunAjaran, sekolahId])

  useEffect(() => { fetchTahun() }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const openAdd = () => {
    reset({ tahunAjaran, jumlahRombel: 1, jumlahSiswa: 0 })
    setValue('tahunAjaran', tahunAjaran)
    setEditId(null)
    setModalOpen(true)
    setError('')
  }

  const openEdit = async (id: string) => {
    const item = data.find(d => d.id === id)
    if (item) { reset(item); setEditId(id); setModalOpen(true); setError('') }
  }

  const onSubmit = async (formData: any) => {
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/rombongan-belajar/${editId}` : '/api/rombongan-belajar'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          jumlahRombel: parseInt(formData.jumlahRombel),
          jumlahSiswa: parseInt(formData.jumlahSiswa ?? '0'),
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Terjadi kesalahan'); return }
      setModalOpen(false)
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/rombongan-belajar/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchData()
  }

  // Hitung total rombel
  const totalRombel = data.reduce((s, d) => s + d.jumlahRombel, 0)
  const totalSiswa = data.reduce((s, d) => s + d.jumlahSiswa, 0)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Rombongan Belajar</h2>
              <p className="text-xs text-gray-500">Tahun Ajaran: {tahunAjaran} • Total: {totalRombel} rombel, {totalSiswa} siswa</p>
            </div>
            <div className="flex gap-2 items-center">
              <input
                value={tahunAjaran}
                onChange={e => setTahunAjaran(e.target.value)}
                placeholder="2024/2025"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              />
              <Button onClick={openAdd}><Plus size={16} /> Tambah</Button>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : data.length === 0 ? (
          <EmptyState
            message="Belum ada data rombongan belajar untuk tahun ajaran ini"
            icon={<BookOpen size={40} />}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>No</Th>
                <Th>Tahun Ajaran</Th>
                <Th>Tingkat</Th>
                <Th className="text-center">Jumlah Rombel</Th>
                <Th className="text-center">Jumlah Siswa</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <Td className="text-gray-400">{idx + 1}</Td>
                  <Td>{item.tahunAjaran}</Td>
                  <Td>
                    <Badge color="blue">Kelas {item.tingkat}</Badge>
                  </Td>
                  <Td className="text-center font-semibold">{item.jumlahRombel}</Td>
                  <Td className="text-center">{item.jumlahSiswa}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(item.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
              {/* Footer row */}
              <tr className="bg-blue-50 font-semibold">
                <Td colSpan={3} className="text-right font-bold text-blue-800">Total</Td>
                <Td className="text-center font-bold text-blue-800">{totalRombel}</Td>
                <Td className="text-center font-bold text-blue-800">{totalSiswa}</Td>
                <Td></Td>
              </tr>
            </tbody>
          </Table>
        )}
      </Card>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Rombongan Belajar' : 'Tambah Rombongan Belajar'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <Input
            label="Tahun Ajaran *"
            placeholder="2024/2025"
            {...register('tahunAjaran', { required: true, pattern: /^\d{4}\/\d{4}$/ })}
          />
          <Select label="Tingkat Kelas *" options={TINGKAT_OPTIONS} placeholder="Pilih tingkat" {...register('tingkat', { required: true })} />
          <Input label="Jumlah Rombongan Belajar *" type="number" min="1" max="50" {...register('jumlahRombel', { required: true, min: 1 })} />
          <Input label="Jumlah Siswa (total)" type="number" min="0" {...register('jumlahSiswa')} />
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* Hapus */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-sm text-gray-600 mb-4">Yakin hapus data rombongan belajar ini?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
