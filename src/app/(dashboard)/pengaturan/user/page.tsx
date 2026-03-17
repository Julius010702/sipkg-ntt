'use client'
// src/app/(dashboard)/pengaturan/user/page.tsx
import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardHeader, CardBody, Table, Th, Td, Button,
  Badge, Modal, Input, Select, Spinner, EmptyState
} from '@/components/ui'
import { Plus, Pencil, Trash2, Users, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'

const ROLE_OPTIONS = [
  { value: 'ADMIN_SEKOLAH', label: 'Admin Sekolah' },
  { value: 'ADMIN_PUSAT', label: 'Admin Pusat' },
]

export default function PengaturanUserPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [sekolahList, setSekolahList] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
  const watchRole = watch('role')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ ...(search && { search }) })
    const res = await fetch(`/api/users?${params}`)
    const json = await res.json()
    setData(json.data ?? [])
    setLoading(false)
  }, [search])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    fetch('/api/sekolah?perPage=999').then(r => r.json()).then(j => setSekolahList(j.data ?? []))
  }, [])

  const openAdd = () => { reset({ role: 'ADMIN_SEKOLAH' }); setEditId(null); setModalOpen(true); setError('') }
  const openEdit = (user: any) => {
    reset({ nama: user.nama, email: user.email, role: user.role, sekolahId: user.sekolahId ?? '' })
    setEditId(user.id)
    setModalOpen(true)
    setError('')
  }

  const onSubmit = async (formData: any) => {
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/users/${editId}` : '/api/users'
      const method = editId ? 'PUT' : 'POST'
      const body = { ...formData, sekolahId: formData.sekolahId || null }
      if (editId && !body.password) delete body.password
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
    await fetch(`/api/users/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchData()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Pengaturan User</h2>
              <p className="text-xs text-gray-500">{data.length} pengguna terdaftar</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
              <Button onClick={openAdd}><Plus size={16} /> Tambah User</Button>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : data.length === 0 ? (
          <EmptyState message="Belum ada pengguna" icon={<Users size={40} />} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>No</Th>
                <Th>Nama</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Sekolah</Th>
                <Th>Status</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((user, idx) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <Td className="text-gray-400">{idx + 1}</Td>
                  <Td className="font-medium text-gray-900">{user.nama}</Td>
                  <Td className="text-gray-500 text-xs">{user.email}</Td>
                  <Td>
                    <Badge color={user.role === 'ADMIN_PUSAT' ? 'purple' : 'blue'}>
                      {user.role === 'ADMIN_PUSAT' ? 'Admin Pusat' : 'Admin Sekolah'}
                    </Badge>
                  </Td>
                  <Td className="text-xs text-gray-500">{user.sekolah?.nama ?? '-'}</Td>
                  <Td>
                    <Badge color={user.statusAktif === 'AKTIF' ? 'green' : 'red'}>
                      {user.statusAktif}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(user.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Modal Form User */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit User' : 'Tambah User Baru'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <Input label="Nama Lengkap *" placeholder="Nama pengguna" {...register('nama', { required: true })} />
          <Input label="Email *" type="email" placeholder="email@nttprov.go.id" {...register('email', { required: true })} />
          <div className="relative">
            <Input
              label={editId ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 karakter"
              {...register('password', { required: !editId, minLength: 6 })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Select label="Role *" options={ROLE_OPTIONS} placeholder="Pilih role" {...register('role', { required: true })} />
          {watchRole === 'ADMIN_SEKOLAH' && (
            <Select
              label="Sekolah *"
              options={sekolahList.map(s => ({ value: s.id, label: `${s.jenisSekolah} - ${s.nama}` }))}
              placeholder="Pilih sekolah"
              {...register('sekolahId')}
            />
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>{editId ? 'Simpan' : 'Tambah User'}</Button>
          </div>
        </form>
      </Modal>

      {/* Hapus */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Konfirmasi Nonaktifkan User" size="sm">
        <p className="text-sm text-gray-600 mb-4">Apakah Anda yakin ingin menonaktifkan pengguna ini?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Nonaktifkan</Button>
        </div>
      </Modal>
    </div>
  )
}
