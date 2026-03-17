'use client'
// src/app/(dashboard)/guru/page.tsx
import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardHeader, CardBody, Table, Th, Td, Button,
  Badge, Modal, Input, Select, Pagination, Spinner, EmptyState
} from '@/components/ui'
import { Plus, Search, Pencil, Trash2, GraduationCap } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { formatTanggal, statusGuruLabel } from '@/lib/utils'

const STATUS_GURU_OPTIONS = [
  { value: 'PNS', label: 'PNS' },
  { value: 'PPPK', label: 'P3K' },
  { value: 'HONORER', label: 'Honorer' },
  { value: 'GTT', label: 'GTT' },
]

const JK_OPTIONS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
]

export default function GuruPage() {
  const [data, setData] = useState<any[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPage: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [jabatanList, setJabatanList] = useState<any[]>([])
  const [mapelList, setMapelList] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: '20',
        ...(search && { search }),
      })
      const res = await fetch(`/api/guru?${params}`)
      const json = await res.json()
      setData(json.data ?? [])
      setMeta(json.meta ?? { total: 0, page: 1, totalPage: 1 })
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    fetch('/api/jabatan').then(r => r.json()).then(j => setJabatanList(j.data ?? []))
    fetch('/api/mata-pelajaran').then(r => r.json()).then(j => setMapelList(j.data ?? []))
  }, [])

  const openAdd = () => { setEditId(null); reset({}); setModalOpen(true); setError('') }

  const openEdit = async (id: string) => {
    const res = await fetch(`/api/guru/${id}`)
    const json = await res.json()
    const g = json.data
    reset({
      ...g,
      tanggalLahir: g.tanggalLahir ? g.tanggalLahir.split('T')[0] : '',
      tmtPengangkatan: g.tmtPengangkatan ? g.tmtPengangkatan.split('T')[0] : '',
    })
    setEditId(id)
    setModalOpen(true)
    setError('')
  }

  const onSubmit = async (formData: any) => {
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/guru/${editId}` : '/api/guru'
      const method = editId ? 'PUT' : 'POST'
      const body = {
        ...formData,
        jumlahJamMengajar: parseInt(formData.jumlahJamMengajar || '0'),
        jabatanId: formData.jabatanId || null,
        mataPelajaranId: formData.mataPelajaranId || null,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Terjadi kesalahan')
        return
      }
      setModalOpen(false)
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/guru/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchData()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Data Guru</h2>
              <p className="text-xs text-gray-500">{meta.total} guru terdaftar</p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIP..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button onClick={openAdd}>
                <Plus size={16} />
                <span className="hidden md:inline">Tambah Guru</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : data.length === 0 ? (
          <EmptyState message="Belum ada data guru" icon={<GraduationCap size={40} />} />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>No</Th>
                  <Th>Nama Guru</Th>
                  <Th>NIP</Th>
                  <Th>Status</Th>
                  <Th>Mata Pelajaran</Th>
                  <Th>Jam/Minggu</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((guru, idx) => (
                  <tr key={guru.id} className="hover:bg-gray-50">
                    <Td className="text-gray-400">{(page - 1) * 20 + idx + 1}</Td>
                    <Td>
                      <div>
                        <p className="font-medium text-gray-900">{guru.nama}</p>
                        <p className="text-xs text-gray-500">
                          {guru.jenisKelamin === 'L' ? 'L' : 'P'} • {guru.jabatan?.nama ?? '-'}
                        </p>
                      </div>
                    </Td>
                    <Td className="text-gray-500">{guru.nip ?? '-'}</Td>
                    <Td>
                      <Badge color={guru.statusGuru === 'PNS' ? 'blue' : guru.statusGuru === 'PPPK' ? 'green' : 'gray'}>
                        {statusGuruLabel(guru.statusGuru)}
                      </Badge>
                    </Td>
                    <Td>{guru.mataPelajaran?.nama ?? '-'}</Td>
                    <Td>{guru.jumlahJamMengajar}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(guru.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(guru.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600">
                          <Trash2 size={14} />
                        </button>
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

      {/* Modal Tambah/Edit Guru */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Data Guru' : 'Tambah Guru Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Nama Lengkap *" placeholder="Nama guru" error={errors.nama?.message as string} {...register('nama', { required: 'Nama wajib diisi' })} />
            </div>
            <Input label="NIP" placeholder="18 digit NIP (opsional)" {...register('nip')} />
            <Input label="NUPTK" placeholder="NUPTK (opsional)" {...register('nuptk')} />
            <Select
              label="Jenis Kelamin *"
              options={JK_OPTIONS}
              placeholder="Pilih jenis kelamin"
              {...register('jenisKelamin', { required: true })}
            />
            <Select
              label="Status Kepegawaian *"
              options={STATUS_GURU_OPTIONS}
              placeholder="Pilih status"
              {...register('statusGuru', { required: true })}
            />
            <Input label="Tempat Lahir" placeholder="Kota/Kab lahir" {...register('tempatLahir')} />
            <Input label="Tanggal Lahir" type="date" {...register('tanggalLahir')} />
            <Input label="Pendidikan Terakhir" placeholder="S1/S2/D4" {...register('pendidikanTerakhir')} />
            <Input label="Jurusan/Program Studi" placeholder="Jurusan" {...register('jurusan')} />
            <Select
              label="Jabatan"
              options={jabatanList.map(j => ({ value: j.id, label: j.nama }))}
              placeholder="Pilih jabatan"
              {...register('jabatanId')}
            />
            <Select
              label="Mata Pelajaran Diampu"
              options={mapelList.map(m => ({ value: m.id, label: m.nama }))}
              placeholder="Pilih mata pelajaran"
              {...register('mataPelajaranId')}
            />
            <Input
              label="Jumlah Jam Mengajar/Minggu"
              type="number"
              placeholder="0"
              min="0"
              max="40"
              {...register('jumlahJamMengajar')}
            />
            <Input label="No SK Pengangkatan" placeholder="No SK" {...register('noSk')} />
            <Input label="TMT Pengangkatan" type="date" {...register('tmtPengangkatan')} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>{editId ? 'Simpan Perubahan' : 'Tambah Guru'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Apakah Anda yakin ingin menghapus data guru ini? Data tidak akan hilang permanen (soft delete).
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
