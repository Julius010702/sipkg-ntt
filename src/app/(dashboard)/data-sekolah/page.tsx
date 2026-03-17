'use client'
// src/app/(dashboard)/data-sekolah/page.tsx
import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardHeader, CardBody, Table, Th, Td, Button,
  Badge, Modal, Input, Select, Pagination, Spinner, EmptyState
} from '@/components/ui'
import { Plus, Search, Pencil, Trash2, School } from 'lucide-react'
import { useForm } from 'react-hook-form'

const JENIS_OPTIONS = [
  { value: 'SMA', label: 'SMA' },
  { value: 'SMK', label: 'SMK' },
  { value: 'SLB', label: 'SLB' },
]

export default function DataSekolahPage() {
  const [data, setData] = useState<any[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPage: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [kabupatenList, setKabupatenList] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page), perPage: '20',
        ...(search && { search }),
        ...(filterJenis && { jenis: filterJenis }),
      })
      const res = await fetch(`/api/sekolah?${params}`)
      const json = await res.json()
      setData(json.data ?? [])
      setMeta(json.meta ?? { total: 0, page: 1, totalPage: 1 })
    } finally {
      setLoading(false)
    }
  }, [page, search, filterJenis])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    fetch('/api/kabupaten').then(r => r.json()).then(j => setKabupatenList(j.data ?? []))
  }, [])

  const openAdd = () => { setEditId(null); reset({}); setModalOpen(true); setError('') }

  const openEdit = async (id: string) => {
    const res = await fetch(`/api/sekolah/${id}`)
    const json = await res.json()
    reset(json.data)
    setEditId(id)
    setModalOpen(true)
    setError('')
  }

  const onSubmit = async (formData: any) => {
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/sekolah/${editId}` : '/api/sekolah'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
    await fetch(`/api/sekolah/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchData()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Data Sekolah</h2>
              <p className="text-xs text-gray-500">{meta.total} sekolah terdaftar</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama / NPSN..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
                />
              </div>
              <select
                value={filterJenis}
                onChange={e => { setFilterJenis(e.target.value); setPage(1) }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Jenis</option>
                <option value="SMA">SMA</option>
                <option value="SMK">SMK</option>
                <option value="SLB">SLB</option>
              </select>
              <Button onClick={openAdd}><Plus size={16} /><span className="hidden md:inline">Tambah Sekolah</span></Button>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : data.length === 0 ? (
          <EmptyState message="Belum ada data sekolah" icon={<School size={40} />} />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>No</Th>
                  <Th>Nama Sekolah</Th>
                  <Th>NPSN</Th>
                  <Th>Jenis</Th>
                  <Th>Kabupaten</Th>
                  <Th className="text-center">Guru</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <Td className="text-gray-400">{(page - 1) * 20 + idx + 1}</Td>
                    <Td>
                      <div>
                        <p className="font-medium text-gray-900">{s.nama}</p>
                        <p className="text-xs text-gray-500">{s.kepalaSekolah ?? '-'}</p>
                      </div>
                    </Td>
                    <Td className="text-gray-500 font-mono text-xs">{s.npsn}</Td>
                    <Td>
                      <Badge color={s.jenisSekolah === 'SMA' ? 'blue' : s.jenisSekolah === 'SMK' ? 'green' : 'purple'}>
                        {s.jenisSekolah}
                      </Badge>
                    </Td>
                    <Td className="text-gray-500 text-xs">{s.kabupaten?.nama}</Td>
                    <Td className="text-center">{s._count?.guru ?? 0}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={meta.page} totalPage={meta.totalPage} onPageChange={setPage} />
          </>
        )}
      </Card>

      {/* Modal Form */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Data Sekolah' : 'Tambah Sekolah Baru'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Nama Sekolah *" placeholder="SMA Negeri 1 ..." {...register('nama', { required: true })} />
            </div>
            <Input label="NPSN *" placeholder="8 digit" maxLength={8} {...register('npsn', { required: true, minLength: 8, maxLength: 8 })} />
            <Select label="Jenis Sekolah *" options={JENIS_OPTIONS} placeholder="Pilih jenis" {...register('jenisSekolah', { required: true })} />
            <Select
              label="Kabupaten/Kota *"
              options={kabupatenList.map(k => ({ value: k.id, label: k.nama }))}
              placeholder="Pilih kabupaten"
              {...register('kabupatenId', { required: true })}
            />
            <Input label="Kepala Sekolah" placeholder="Nama kepala sekolah" {...register('kepalaSekolah')} />
            <Input label="NIP Kepala Sekolah" placeholder="NIP" {...register('nip')} />
            <Input label="Nomor Telepon" placeholder="(0380) ..." {...register('telepon')} />
            <Input label="Email Sekolah" type="email" placeholder="sekolah@nttprov.go.id" {...register('email')} />
            <div className="md:col-span-2">
              <Input label="Alamat Lengkap" placeholder="Jl. ..." {...register('alamat')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>{editId ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-sm text-gray-600 mb-4">Yakin ingin menonaktifkan sekolah ini?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
