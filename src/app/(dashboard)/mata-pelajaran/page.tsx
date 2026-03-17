'use client'
// src/app/(dashboard)/mata-pelajaran/page.tsx
import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardHeader, CardBody, Table, Th, Td, Button,
  Badge, Modal, Input, Spinner, EmptyState
} from '@/components/ui'
import { Plus, Pencil, Trash2, BookOpen, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'

export default function MataPelajaranPage() {
  const [data, setData] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/mata-pelajaran')
    const json = await res.json()
    setData(json.data ?? [])
    setFiltered(json.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!search) { setFiltered(data); return }
    setFiltered(data.filter(d =>
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.kode.toLowerCase().includes(search.toLowerCase())
    ))
  }, [search, data])

  const openAdd = () => { reset({}); setEditId(null); setModalOpen(true); setError('') }
  const openEdit = (item: any) => { reset({ ...item }); setEditId(item.id); setModalOpen(true); setError('') }

  const onSubmit = async (formData: any) => {
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/mata-pelajaran/${editId}` : '/api/mata-pelajaran'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, jamPerMinggu: parseInt(formData.jamPerMinggu) }),
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
    await fetch(`/api/mata-pelajaran/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchData()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Mata Pelajaran</h2>
              <p className="text-xs text-gray-500">{data.length} mata pelajaran</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari mata pelajaran..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
                />
              </div>
              <Button onClick={openAdd}><Plus size={16} /> Tambah</Button>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState message="Belum ada mata pelajaran" icon={<BookOpen size={40} />} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>No</Th>
                <Th>Kode</Th>
                <Th>Nama Mata Pelajaran</Th>
                <Th className="text-center">Jam/Minggu</Th>
                <Th>Deskripsi</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <Td className="text-gray-400">{idx + 1}</Td>
                  <Td><Badge color="gray">{item.kode}</Badge></Td>
                  <Td className="font-medium text-gray-900">{item.nama}</Td>
                  <Td className="text-center font-semibold text-blue-700">{item.jamPerMinggu}</Td>
                  <Td className="text-gray-500 text-xs">{item.deskripsi ?? '-'}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <Input label="Kode *" placeholder="Contoh: MTK" {...register('kode', { required: true })} />
          <Input label="Nama Mata Pelajaran *" placeholder="Matematika" {...register('nama', { required: true })} />
          <Input label="Jam per Minggu *" type="number" min="1" max="10" placeholder="4" {...register('jamPerMinggu', { required: true })} />
          <Input label="Deskripsi" placeholder="Opsional" {...register('deskripsi')} />
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-sm text-gray-600 mb-4">Yakin ingin menghapus mata pelajaran ini?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
