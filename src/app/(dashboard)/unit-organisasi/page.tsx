'use client'
// src/app/(dashboard)/unit-organisasi/page.tsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import {
  Card, CardHeader, CardBody, Table, Th, Td, Button,
  Modal, Input, Select, Spinner, EmptyState, Badge
} from '@/components/ui'
import { Pencil, Trash2, Building2, ArrowUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'

// ─── Konstanta eselon ────────────────────────────────────────────────────────
const ESELON_OPTIONS = [
  { value: 'IA', label: 'IA' },
  { value: 'IB', label: 'IB' },
  { value: 'IIA', label: 'IIA' },
  { value: 'IIB', label: 'IIB' },
  { value: 'IIIA', label: 'IIIA' },
  { value: 'IIIB', label: 'IIIB' },
  { value: 'IVA', label: 'IVA' },
  { value: 'IVB', label: 'IVB' },
  { value: 'VA', label: 'VA' },
  { value: 'NON ESELON', label: 'NON ESELON' },
]

const ROWS_OPTIONS = [
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
]

type FormValues = {
  nama: string
  eselon: string
  deskripsi?: string
  parentId?: string
}

export default function UnitOrganisasiPage() {
  const { data: session } = useSession()
  const sekolahId = (session?.user as any)?.sekolahId

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Tabel state
  const [search, setSearch] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<'nama' | 'kode'>('nama')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>()

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!sekolahId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/unit-organisasi?sekolahId=${sekolahId}`)
      const json = await res.json()
      setData(json.data ?? [])
    } catch {
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [sekolahId])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Form helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    reset({ nama: '', eselon: '', deskripsi: '', parentId: '' })
    setEditId(null)
    setError('')
  }

  const openEdit = (item: any) => {
    reset({
      nama: item.nama,
      eselon: item.kode ?? '',   // kode dipakai untuk menyimpan eselon
      deskripsi: item.deskripsi ?? '',
      parentId: item.parentId ?? '',
    })
    setEditId(item.id)
    setError('')
  }

  const handleCancel = () => {
    reset({ nama: '', eselon: '', deskripsi: '', parentId: '' })
    setEditId(null)
    setError('')
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (formData: FormValues) => {
    if (!sekolahId) {
      setError('Session tidak valid, silakan refresh halaman.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/unit-organisasi/${editId}` : '/api/unit-organisasi'
      const method = editId ? 'PUT' : 'POST'

      const payload = {
        nama: formData.nama,
        kode: formData.eselon || null,      // simpan eselon ke field kode
        deskripsi: formData.deskripsi || null,
        parentId: formData.parentId || null,
        sekolahId,                           // ← FIX: sertakan sekolahId
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Gagal menyimpan data')
        return
      }

      handleCancel()
      fetchData()
    } catch {
      setError('Terjadi kesalahan, coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/unit-organisasi/${deleteId}`, { method: 'DELETE' })
    } finally {
      setDeleteId(null)
      fetchData()
    }
  }

  // ─── Sort ─────────────────────────────────────────────────────────────────
  const handleSort = (field: 'nama' | 'kode') => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  // ─── Filter + Sort + Paginate ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = data.filter(
      d =>
        d.nama.toLowerCase().includes(q) ||
        (d.kode ?? '').toLowerCase().includes(q)
    )
    list.sort((a, b) => {
      const av = (sortField === 'kode' ? a.kode : a.nama) ?? ''
      const bv = (sortField === 'kode' ? b.kode : b.nama) ?? ''
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return list
  }, [data, search, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const SortIcon = ({ field }: { field: 'nama' | 'kode' }) => (
    <ArrowUpDown
      size={12}
      className={`inline ml-1 cursor-pointer ${sortField === field ? 'text-blue-500' : 'text-gray-300'}`}
      onClick={() => handleSort(field)}
    />
  )

  // ─── Urutkan (reorder by eselon level) ───────────────────────────────────
  const handleUrutkan = () => {
    setSortField('kode')
    setSortDir('asc')
    setPage(1)
  }

  // Parent options untuk dropdown (exclude self saat edit)
  const parentOptions = data
    .filter(d => d.id !== editId)
    .map(d => ({ value: d.id, label: d.nama }))

  return (
    <div className="space-y-4">

      {/* ─── Form Inline ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 text-sm">Form Unit Organisasi</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Eselon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eselon
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  {...register('eselon')}
                >
                  <option value="">--- Pilih Eselon ---</option>
                  {ESELON_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Nama Unit Organisasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Organisasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama unit organisasi..."
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nama ? 'border-red-400' : 'border-gray-300'}`}
                  {...register('nama', { required: 'Nama unit wajib diisi' })}
                />
                {errors.nama && (
                  <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>
                )}
              </div>

              {/* Unit Induk */}
              {parentOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Induk <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    {...register('parentId')}
                  >
                    <option value="">— Tidak ada (unit utama) —</option>
                    {parentOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <input
                  type="text"
                  placeholder="Deskripsi unit (opsional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('deskripsi')}
                />
              </div>
            </div>

            {/* Tombol aksi */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleUrutkan}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ArrowUpDown size={14} />
                Urutkan
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  editId ? '💾 Update' : '💾 Simpan'
                )}
              </button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* ─── Tabel ────────────────────────────────────────────────────────── */}
      <Card>
        <CardBody>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tampilkan</span>
              <select
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {ROWS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span className="text-sm text-gray-600">entri</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cari:</span>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Cari unit atau eselon..."
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={40} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">
                {search ? 'Tidak ada data yang cocok' : 'Belum ada unit organisasi'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">
                      No
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('nama')}
                    >
                      Unit Organisasi <SortIcon field="nama" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Unit Induk
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('kode')}
                    >
                      Eselon <SortIcon field="kode" />
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors ${editId === item.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {(page - 1) * rowsPerPage + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.nama}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {item.parentId
                          ? data.find(d => d.id === item.parentId)?.nama ?? '—'
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {item.kode ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            {item.kode}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer: info + pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Menampilkan {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} dari {filtered.length} entri
                {search && ` (difilter dari ${data.length} total)`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ─── Modal Konfirmasi Hapus ────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-600 mb-5">
              Yakin ingin menghapus unit organisasi ini? Data yang sudah terhapus tidak dapat dikembalikan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}