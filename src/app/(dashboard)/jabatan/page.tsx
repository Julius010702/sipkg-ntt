'use client'
// src/app/(dashboard)/jabatan/page.tsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Pencil, Trash2, UserCog, ChevronRight, ChevronDown, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'

const PANGKAT_GOL = [
  'I/a (Juru Muda)', 'I/b (Juru Muda Tk.I)', 'I/c (Juru)', 'I/d (Juru Tk.I)',
  'II/a (Pengatur Muda)', 'II/b (Pengatur Muda Tk.I)', 'II/c (Pengatur)', 'II/d (Pengatur Tk.I)',
  'III/a (Penata Muda)', 'III/b (Penata Muda Tk.I)', 'III/c (Penata)', 'III/d (Penata Tk.I)',
  'IV/a (Pembina)', 'IV/b (Pembina Tk.I)', 'IV/c (Pembina Utama Muda)',
  'IV/d (Pembina Utama Madya)', 'IV/e (Pembina Utama)',
]
const PENDIDIKAN = [
  'Sekolah Dasar', 'SLTP', 'SLTA', 'SLTA Kejuruan',
  'Diploma I', 'Diploma II', 'Diploma III/Sarjana Muda', 'Diploma IV',
  'S-1/Sarjana', 'S-2', 'S-3/Doktor',
]
const JENIS_JABATAN = [
  'Jabatan Pimpinan Tinggi Utama', 'Jabatan Pimpinan Tinggi Madya',
  'Jabatan Pimpinan Tinggi Pratama', 'Jabatan Administrator',
  'Jabatan Pengawas', 'Jabatan Pelaksana', 'Jabatan Fungsional',
]

// ── Urusan → Jabatan pelaksana map ──────────────────────────────────────────
const URUSAN_JABATAN: Record<string, string[]> = {
  KLEREK: [
    'Pengelola Administrasi', 'Pengadministrasi Umum', 'Pengadministrasi Kepegawaian',
    'Pengadministrasi Keuangan', 'Pengadministrasi Persuratan', 'Caraka',
    'Operator Komputer', 'Resepsionis',
  ],
  OPERATOR: [
    'Operator Sistem Informasi', 'Operator Komputer', 'Operator Mesin',
    'Teknisi Komputer', 'Pengelola Data', 'Pengelola Sistem Jaringan',
  ],
  TEKNISI: [
    'Teknisi Sarana dan Prasarana', 'Teknisi Listrik', 'Teknisi Jaringan',
    'Teknisi Mesin', 'Pemelihara Bangunan', 'Pengemudi',
  ],
  ANALIS: [
    'Analis Kebijakan', 'Analis Data', 'Analis Keuangan',
    'Analis Kepegawaian', 'Analis Hukum', 'Analis Sistem Informasi',
  ],
  PENGELOLA: [
    'Pengelola Keuangan', 'Pengelola Barang', 'Pengelola Kepegawaian',
    'Pengelola Program', 'Pengelola Arsip', 'Bendahara',
  ],
  PENYULUH: [
    'Penyuluh Pendidikan', 'Penyuluh Kesehatan', 'Penyuluh Pertanian',
    'Penyuluh Hukum', 'Penyuluh Sosial',
  ],
}

const URUSAN_TREE = [
  { id: 'absolut', label: 'Absolut', children: [
    { id: 'a1', label: 'Politik Luar Negeri' }, { id: 'a2', label: 'Pertahanan' },
    { id: 'a3', label: 'Keamanan' }, { id: 'a4', label: 'Yustisi' },
    { id: 'a5', label: 'Moneter & Fiskal Nasional' }, { id: 'a6', label: 'Agama' },
  ]},
  { id: 'konkuren', label: 'Konkuren', children: [
    { id: 'kw', label: 'Urusan Wajib', children: [
      { id: 'kw1', label: 'Pendidikan' }, { id: 'kw2', label: 'Kesehatan' }, { id: 'kw3', label: 'Pekerjaan Umum' },
    ]},
    { id: 'kp', label: 'Urusan Pilihan', children: [
      { id: 'kp1', label: 'Kelautan & Perikanan' }, { id: 'kp2', label: 'Pariwisata' }, { id: 'kp3', label: 'Pertanian' },
    ]},
  ]},
]

type FormValues = {
  indukJabatan: string; unitOrganisasi: string; jenisJabatan: string
  nama: string; namaUrusan: string; kode: string
  pangkatTerendah: string; pangkatTertinggi: string
  pendidikanTerendah: string; pendidikanTertinggi: string
  jurusanTerendah: string; jurusanTertinggi: string; deskripsi: string
}
const DEFAULT: FormValues = {
  indukJabatan: '', unitOrganisasi: '', jenisJabatan: 'Jabatan Pelaksana',
  nama: '', namaUrusan: '', kode: '',
  pangkatTerendah: '', pangkatTertinggi: '',
  pendidikanTerendah: '', pendidikanTertinggi: '',
  jurusanTerendah: '', jurusanTertinggi: '', deskripsi: '',
}

// ── Modal Pilih Jabatan ───────────────────────────────────────────────────────
function PilihJabatanModal({ open, onClose, onSave, current }: {
  open: boolean; onClose: () => void
  onSave: (nama: string, urusan: string) => void; current: string
}) {
  const [selectedUrusan, setSelectedUrusan] = useState('')
  const [selectedJabatan, setSelectedJabatan] = useState(current)
  const [search, setSearch] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (open) { setSelectedJabatan(current); setSearch(''); setPage(1) }
  }, [open, current])
  useEffect(() => { setPage(1) }, [selectedUrusan, search])

  const jabatanList = useMemo(() => {
    const base = selectedUrusan
      ? (URUSAN_JABATAN[selectedUrusan] ?? [])
      : Object.values(URUSAN_JABATAN).flat()
    if (!search) return base
    return base.filter(j => j.toLowerCase().includes(search.toLowerCase()))
  }, [selectedUrusan, search])

  const totalPages = Math.max(1, Math.ceil(jabatanList.length / rowsPerPage))
  const paginated = jabatanList.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-[600px] mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Form Jabatan Pelaksana</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Filter urusan */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 w-28 flex-shrink-0">Pilih Urusan</label>
            <select
              value={selectedUrusan}
              onChange={e => setSelectedUrusan(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-Pilih Urusan-</option>
              {Object.keys(URUSAN_JABATAN).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                className="px-2 py-1.5 border border-gray-300 rounded text-sm bg-white focus:outline-none">
                {[10, 15, 25].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari jabatan..."
                className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44" />
            </div>
          </div>

          {/* Tabel */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-10">No</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Nama Jabatan</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-28">Urusan</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase w-14"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-400">
                      No data available in table
                    </td>
                  </tr>
                ) : paginated.map((jabatan, idx) => {
                  const urusan = selectedUrusan ||
                    Object.entries(URUSAN_JABATAN).find(([, list]) => list.includes(jabatan))?.[0] || ''
                  const isSelected = selectedJabatan === jabatan
                  return (
                    <tr key={jabatan} onClick={() => setSelectedJabatan(jabatan)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-3 py-2.5 text-gray-400 text-xs">{(page - 1) * rowsPerPage + idx + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-800">{jabatan}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{urusan}</td>
                      <td className="px-3 py-2.5 text-center">
                        <input type="radio" checked={isSelected} readOnly className="accent-blue-600 w-4 h-4"
                          onClick={e => { e.stopPropagation(); setSelectedJabatan(jabatan) }} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination info */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {jabatanList.length === 0
                ? 'Showing 0 to 0 of 0 entries'
                : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(page * rowsPerPage, jabatanList.length)} of ${jabatanList.length} entries`}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                ← Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(p); return acc
                }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e${i}`} className="px-2 text-xs text-gray-400">…</span>
                  : <button key={p} onClick={() => setPage(p as number)}
                      className={`px-3 py-1.5 text-xs border rounded-lg ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}>{p}</button>
                )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || !jabatanList.length}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Batal</button>
          <button
            disabled={!selectedJabatan}
            onClick={() => {
              if (!selectedJabatan) return
              const urusan = selectedUrusan ||
                Object.entries(URUSAN_JABATAN).find(([, list]) => list.includes(selectedJabatan))?.[0] || ''
              onSave(selectedJabatan, urusan)
              onClose()
            }}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            ✔ Pilih Jabatan
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Urusan Tree ─────────────────────────────────────────────────────────
function UrusanNode({ node, selected, onSelect, depth = 0 }: any) {
  const [open, setOpen] = useState(depth < 1)
  const hasChildren = node.children?.length > 0
  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 ${selected === node.label ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
        style={{ paddingLeft: `${8 + depth * 20}px` }}
        onClick={() => { if (hasChildren) setOpen((o: boolean) => !o); else onSelect(node.label) }}
      >
        {hasChildren
          ? (open ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />)
          : <input type="radio" readOnly checked={selected === node.label} className="accent-blue-600" />}
        <span className={`text-sm ${hasChildren ? 'font-semibold' : ''}`}>{node.label}</span>
      </div>
      {hasChildren && open && node.children.map((c: any) => (
        <UrusanNode key={c.id} node={c} selected={selected} onSelect={onSelect} depth={depth + 1} />
      ))}
    </div>
  )
}

function UrusanModal({ open, onClose, onSave, current }: any) {
  const [sel, setSel] = useState(current)
  useEffect(() => { if (open) setSel(current) }, [open, current])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-[440px] mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Form Urusan per Jabatan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase px-2 mb-2">📁 Urusan</p>
            {URUSAN_TREE.map(n => <UrusanNode key={n.id} node={n} selected={sel} onSelect={setSel} depth={1} />)}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
          <button onClick={() => { onSave(sel); onClose() }} disabled={!sel}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40">
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function JabatanPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pilihJabatanModal, setPilihJabatanModal] = useState(false)
  const [urusanModal, setUrusanModal] = useState(false)
  const [search, setSearch] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [page, setPage] = useState(1)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({ defaultValues: DEFAULT })
  const namaUrusan = watch('namaUrusan')
  const namaJabatan = watch('nama')

  const loadData = useCallback(async () => {
    setLoading(true)
    try { const res = await fetch('/api/jabatan'); const j = await res.json(); setData(j.data ?? []) }
    catch { setError('Gagal memuat data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCancel = () => { reset(DEFAULT); setEditId(null); setError('') }

  const openEdit = (item: any) => {
    reset({
      indukJabatan: item.indukJabatan ?? '', unitOrganisasi: item.unitOrganisasi ?? '',
      jenisJabatan: item.jenisJabatan ?? 'Jabatan Pelaksana', nama: item.nama,
      namaUrusan: item.namaUrusan ?? '', kode: item.kode,
      pangkatTerendah: item.pangkatTerendah ?? '', pangkatTertinggi: item.pangkatTertinggi ?? '',
      pendidikanTerendah: item.pendidikanTerendah ?? '', pendidikanTertinggi: item.pendidikanTertinggi ?? '',
      jurusanTerendah: item.jurusanTerendah ?? '', jurusanTertinggi: item.jurusanTertinggi ?? '',
      deskripsi: item.deskripsi ?? '',
    })
    setEditId(item.id); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (fd: FormValues) => {
    setSaving(true); setError('')
    try {
      const url = editId ? `/api/jabatan/${editId}` : '/api/jabatan'
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode: fd.kode, nama: fd.nama,
          indukJabatan: fd.indukJabatan || null, unitOrganisasi: fd.unitOrganisasi || null,
          jenisJabatan: fd.jenisJabatan || null, namaUrusan: fd.namaUrusan || null,
          pangkatTerendah: fd.pangkatTerendah || null, pangkatTertinggi: fd.pangkatTertinggi || null,
          pendidikanTerendah: fd.pendidikanTerendah || null, pendidikanTertinggi: fd.pendidikanTertinggi || null,
          jurusanTerendah: fd.jurusanTerendah || null, jurusanTertinggi: fd.jurusanTertinggi || null,
          deskripsi: fd.deskripsi || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Gagal menyimpan data'); return }
      handleCancel(); loadData()
    } catch { setError('Terjadi kesalahan, coba lagi.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/jabatan/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null); loadData()
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter(d =>
      d.nama.toLowerCase().includes(q) || (d.kode ?? '').toLowerCase().includes(q) ||
      (d.jenisJabatan ?? '').toLowerCase().includes(q)
    )
  }, [data, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="space-y-4">

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="text-sm font-semibold text-gray-800">{editId ? '✏️ Edit Jabatan' : 'Form Tambah Jabatan'}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Induk Jabatan</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('indukJabatan')}>
                <option value="">— Pilih Induk Jabatan —</option>
                {data.filter(d => d.id !== editId).map(d => <option key={d.id} value={d.nama}>{d.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Organisasi</label>
              <input type="text" placeholder="Nama unit organisasi..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('unitOrganisasi')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Jabatan</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('jenisJabatan')}>
                <option value="">— Pilih Jenis —</option>
                {JENIS_JABATAN.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Jabatan <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Contoh: GURU-MAPEL"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.kode ? 'border-red-400' : 'border-gray-300'}`}
                {...register('kode', { required: 'Kode jabatan wajib diisi' })} />
              {errors.kode && <p className="text-xs text-red-500 mt-1">{errors.kode.message}</p>}
            </div>
          </div>

          {/* Nama Jabatan — modal pilih */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jabatan <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm min-h-[38px] text-gray-800">
                {namaJabatan || <span className="text-gray-400">— Belum dipilih —</span>}
              </div>
              <button type="button" onClick={() => setPilihJabatanModal(true)}
                className="flex-shrink-0 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Pilih Jabatan
              </button>
            </div>
            <input type="hidden" {...register('nama', { required: 'Nama jabatan wajib diisi' })} />
            {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>}
          </div>

          {/* Nama Urusan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Urusan</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm min-h-[38px] text-gray-800">
                {namaUrusan || <span className="text-gray-400">— Belum dipilih —</span>}
              </div>
              <button type="button" onClick={() => setUrusanModal(true)}
                className="flex-shrink-0 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Pilih Urusan
              </button>
            </div>
            <input type="hidden" {...register('namaUrusan')} />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea rows={2} placeholder="Deskripsi jabatan (opsional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register('deskripsi')} />
          </div>

          {/* Syarat Jabatan */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Syarat Jabatan</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { side: 'Terendah', color: 'text-blue-600', pangkat: 'pangkatTerendah', pend: 'pendidikanTerendah', jurusan: 'jurusanTerendah' },
                { side: 'Tertinggi', color: 'text-emerald-600', pangkat: 'pangkatTertinggi', pend: 'pendidikanTertinggi', jurusan: 'jurusanTertinggi' },
              ].map(({ side, color, pangkat, pend, jurusan }) => (
                <div key={side} className="space-y-3">
                  <p className={`text-xs font-semibold ${color} uppercase tracking-wide`}>Batas {side}</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pangkat/Golongan Ruang {side}</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" {...register(pangkat as any)}>
                      <option value="">--- Pilih Pangkat/Gol ---</option>
                      {PANGKAT_GOL.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pendidikan {side}</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" {...register(pend as any)}>
                      <option value="">--- Pilih Pendidikan ---</option>
                      {PENDIDIKAN.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Jurusan</label>
                    <input type="text" placeholder="Jurusan..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register(jurusan as any)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Batal</button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Menyimpan...</> : `💾 ${editId ? 'Update' : 'Simpan'}`}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-5 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Daftar Jabatan</h2>
          <p className="text-xs text-gray-400 mt-0.5">{data.length} jabatan terdaftar</p>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tampilkan</span>
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                className="px-2 py-1 border border-gray-300 rounded text-sm bg-white">
                {[10, 15, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-sm text-gray-600">entri</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cari:</span>
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Nama, kode, jenis..."
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12"><UserCog size={40} className="mx-auto text-gray-200 mb-2" /><p className="text-sm text-gray-400">{search ? 'Tidak ada data yang cocok' : 'Belum ada data jabatan'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {['No','Kode','Nama Jabatan','Jenis Jabatan','Unit Org','Pangkat Min','Pendidikan Min','Urusan','Aksi'].map(h => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((item, idx) => (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${editId === item.id ? 'bg-blue-50' : ''}`}>
                      <td className="px-3 py-3 text-gray-400 text-xs">{(page - 1) * rowsPerPage + idx + 1}</td>
                      <td className="px-3 py-3"><span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">{item.kode}</span></td>
                      <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{item.nama}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{item.jenisJabatan ?? '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{item.unitOrganisasi ?? '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{item.pangkatTerendah ?? '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{item.pendidikanTerendah ?? '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{item.namaUrusan ?? '—'}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Menampilkan {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} dari {filtered.length} entri{search && ` (dari ${data.length} total)`}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">← Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).reduce<(number | '...')[]>((acc, p, i, arr) => { if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...'); acc.push(p); return acc }, []).map((p, i) => p === '...' ? <span key={`e${i}`} className="px-2 text-xs text-gray-400">…</span> : <button key={p} onClick={() => setPage(p as number)} className={`px-3 py-1.5 text-xs border rounded-lg ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}>{p}</button>)}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PilihJabatanModal
        open={pilihJabatanModal}
        onClose={() => setPilihJabatanModal(false)}
        onSave={(nama, urusan) => {
          setValue('nama', nama, { shouldValidate: true })
          if (!namaUrusan && urusan) setValue('namaUrusan', urusan)
        }}
        current={namaJabatan}
      />
      <UrusanModal open={urusanModal} onClose={() => setUrusanModal(false)} onSave={(v: string) => setValue('namaUrusan', v)} current={namaUrusan} />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-600 mb-5">Yakin ingin menghapus jabatan ini?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}