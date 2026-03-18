'use client'
// src/app/(dashboard)/anjab/page.tsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Pencil, Trash2, ClipboardList, Eye, Printer, FileText, ChevronRight, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

const WAKTU_EFEKTIF = 75000

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

type AnjabForm = {
  indukJabatan: string; unitOrganisasi: string; jenisJabatan: string
  namaJabatan: string; namaUrusan: string; kodeJabatan: string; tahun: number
  pangkatTerendah: string; pangkatTertinggi: string
  pendidikanTerendah: string; pendidikanTertinggi: string
  jurusanTerendah: string; jurusanTertinggi: string
  ikhtisar: string; tugasPokok: string; hasilKerja: string
  tanggungjawab: string; wewenang: string; kualifikasi: string; syaratJabatan: string
}
const DEFAULT: AnjabForm = {
  indukJabatan: '', unitOrganisasi: '', jenisJabatan: '', namaJabatan: '',
  namaUrusan: '', kodeJabatan: '', tahun: new Date().getFullYear(),
  pangkatTerendah: '', pangkatTertinggi: '',
  pendidikanTerendah: '', pendidikanTertinggi: '',
  jurusanTerendah: '', jurusanTertinggi: '',
  ikhtisar: '', tugasPokok: '', hasilKerja: '',
  tanggungjawab: '', wewenang: '', kualifikasi: '', syaratJabatan: '',
}

// ── Urusan Tree ───────────────────────────────────────────────────────────────
function UrusanNode({ node, selected, onSelect, depth = 0 }: any) {
  const [open, setOpen] = useState(depth < 1)
  const hasChildren = node.children?.length > 0
  return (
    <div>
      <div className={`flex items-center gap-1.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 ${selected === node.label ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
        style={{ paddingLeft: `${8 + depth * 20}px` }}
        onClick={() => { if (hasChildren) setOpen((o: boolean) => !o); else onSelect(node.label) }}>
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
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40">Simpan</button>
        </div>
      </div>
    </div>
  )
}

// ── Form D ────────────────────────────────────────────────────────────────────
function FormDModal({ open, onClose, jabatanList, opd }: any) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6">
      <div className="bg-white rounded-xl shadow-xl w-[1000px] mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Form D — Perhitungan Kebutuhan Pegawai</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              <Printer size={14} /> Cetak
            </button>
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Tutup</button>
          </div>
        </div>
        <div className="p-8">
          <div className="text-center mb-6">
            <p className="font-bold text-sm uppercase">PEMERINTAH PROVINSI NUSA TENGGARA TIMUR</p>
            <p className="text-xs mt-1">FORM D - PERHITUNGAN KEBUTUHAN PEJABAT/PEGAWAI</p>
            {opd && <p className="text-xs mt-2 font-semibold uppercase">UNIT KERJA {opd}</p>}
          </div>
          <table className="w-full text-xs border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>No</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>Nama Jabatan</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>Jumlah Beban Kerja</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>Kebutuhan Pegawai</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>Pegawai ASN</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>+/-</th>
                <th className="border border-gray-400 px-2 py-2 text-center" colSpan={2}>Kebutuhan</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>EJ</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>PJ</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-2 py-1 text-center">Kurang</th>
                <th className="border border-gray-400 px-2 py-1 text-center">Lebih</th>
              </tr>
            </thead>
            <tbody>
              {jabatanList.length === 0 ? (
                <tr><td colSpan={10} className="border border-gray-400 px-3 py-8 text-center text-gray-400">Tidak ada data</td></tr>
              ) : jabatanList.map((item: any, idx: number) => {
                const abk = item.abk ?? []
                const jumlahBeban = abk.reduce((s: number, a: any) => s + (a.waktePenyelesaian ?? (a.volumeBebanKerja * a.normaWaktu)), 0)
                const kebutuhanPegawai = abk.length > 0 ? abk.reduce((s: number, a: any) => s + Math.ceil(Number(a.pegawaiDibutuhkan)), 0) : Math.ceil(jumlahBeban / WAKTU_EFEKTIF)
                const jumlahASN = abk.reduce((s: number, a: any) => s + (a.pegawaiAda ?? 0), 0)
                const selisih = jumlahASN - kebutuhanPegawai
                const kurang = selisih < 0 ? Math.abs(selisih) : 0
                const lebih = selisih > 0 ? selisih : 0
                const ej = kebutuhanPegawai > 0 ? (jumlahASN / kebutuhanPegawai) : 0
                const pjLabel = ej >= 1.0 ? 'A (Sangat Baik)' : ej >= 0.9 ? 'B (Baik)' : ej >= 0.7 ? 'C (Cukup)' : 'D (Sedang)'
                return (
                  <tr key={item.id} className={kurang > 0 ? 'bg-red-50' : lebih > 0 ? 'bg-yellow-50' : ''}>
                    <td className="border border-gray-400 px-2 py-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-400 px-2 py-2 font-medium">{item.namaJabatan}</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">{jumlahBeban.toLocaleString('id-ID')}</td>
                    <td className="border border-gray-400 px-2 py-2 text-center">{kebutuhanPegawai}</td>
                    <td className="border border-gray-400 px-2 py-2 text-center">{jumlahASN}</td>
                    <td className={`border border-gray-400 px-2 py-2 text-center font-semibold ${selisih < 0 ? 'text-red-600' : selisih > 0 ? 'text-yellow-600' : ''}`}>{selisih}</td>
                    <td className="border border-gray-400 px-2 py-2 text-center text-red-700">{kurang > 0 ? `${kurang} Orang` : ''}</td>
                    <td className="border border-gray-400 px-2 py-2 text-center text-yellow-700">{lebih > 0 ? `${lebih} Orang` : ''}</td>
                    <td className="border border-gray-400 px-2 py-2 text-center">{ej.toFixed(2)}</td>
                    <td className="border border-gray-400 px-2 py-2 text-center text-xs">{pjLabel}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AnjabPage() {
  const { data: session } = useSession()
  const role          = (session?.user as any)?.role
  const userSekolahId = (session?.user as any)?.sekolahId

  const [data, setData]               = useState<any[]>([])
  const [sekolahList, setSekolahList] = useState<any[]>([])
  const [jabatanList, setJabatanList] = useState<any[]>([])
  const [unitList, setUnitList]       = useState<any[]>([])
  const [selectedOPD, setSelectedOPD] = useState<string>(userSekolahId ?? '')
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [editId, setEditId]           = useState<string | null>(null)
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [formDOpen, setFormDOpen]     = useState(false)
  const [urusanModal, setUrusanModal] = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [search, setSearch]           = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [page, setPage]               = useState(1)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AnjabForm>({ defaultValues: DEFAULT })
  const namaUrusan = watch('namaUrusan')

  useEffect(() => {
    if (role === 'ADMIN_PUSAT') {
      fetch('/api/sekolah?statusAktif=AKTIF').then(r => r.json()).then(j => setSekolahList(j.data ?? []))
    }
    fetch('/api/jabatan').then(r => r.json()).then(j => setJabatanList(j.data ?? []))
  }, [role])

  useEffect(() => {
    if (selectedOPD) {
      fetch(`/api/unit-organisasi?sekolahId=${selectedOPD}`).then(r => r.json()).then(j => setUnitList(j.data ?? []))
    }
  }, [selectedOPD])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = selectedOPD ? `?sekolahId=${selectedOPD}` : ''
      const res = await fetch(`/api/anjab${params}`)
      const json = await res.json()
      const list = json.data ?? []
      const withAbk = await Promise.all(list.map(async (a: any) => {
        try { const r = await fetch(`/api/anjab/${a.id}/abk`); const j = await r.json(); return { ...a, abk: j.data ?? [] } }
        catch { return { ...a, abk: [] } }
      }))
      setData(withAbk)
    } catch { setError('Gagal memuat data') }
    finally { setLoading(false) }
  }, [selectedOPD])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCancel = () => { reset(DEFAULT); setEditId(null); setError(''); setShowForm(false) }

  const openAdd = () => {
    reset({ ...DEFAULT, tahun: new Date().getFullYear() })
    setEditId(null); setError(''); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEdit = (item: any) => {
    reset({
      indukJabatan: item.indukJabatan ?? '', unitOrganisasi: item.unitOrganisasi ?? '',
      jenisJabatan: item.jenisJabatan ?? '', namaJabatan: item.namaJabatan ?? '',
      namaUrusan: item.namaUrusan ?? '', kodeJabatan: item.kodeJabatan ?? '',
      tahun: item.tahun ?? new Date().getFullYear(),
      pangkatTerendah: item.pangkatTerendah ?? '', pangkatTertinggi: item.pangkatTertinggi ?? '',
      pendidikanTerendah: item.pendidikanTerendah ?? '', pendidikanTertinggi: item.pendidikanTertinggi ?? '',
      jurusanTerendah: item.jurusanTerendah ?? '', jurusanTertinggi: item.jurusanTertinggi ?? '',
      ikhtisar: item.ikhtisar ?? '', tugasPokok: item.tugasPokok ?? '',
      hasilKerja: item.hasilKerja ?? '', tanggungjawab: item.tanggungjawab ?? '',
      wewenang: item.wewenang ?? '', kualifikasi: item.kualifikasi ?? '', syaratJabatan: item.syaratJabatan ?? '',
    })
    setEditId(item.id); setError(''); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (fd: AnjabForm) => {
    setSaving(true); setError('')
    try {
      const url = editId ? `/api/anjab/${editId}` : '/api/anjab'
      const payload: any = { ...fd, tahun: Number(fd.tahun) }
      if (selectedOPD) payload.sekolahId = selectedOPD
      const res = await fetch(url, { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Gagal menyimpan'); return }
      handleCancel(); fetchData()
    } catch { setError('Terjadi kesalahan') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/anjab/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null); fetchData()
  }

  const selectedOPDNama = sekolahList.find(s => s.id === selectedOPD)?.nama ?? ''
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter(d => d.namaJabatan.toLowerCase().includes(q) || (d.kodeJabatan ?? '').toLowerCase().includes(q))
  }, [data, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelCls = "text-sm font-medium text-gray-700"

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <ClipboardList size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Analisis Jabatan (ANJAB) & Analisis Beban Kerja (ABK)</p>
          <p className="text-xs text-blue-600 mt-0.5">Sesuai Permenpan-RB No. 1 Tahun 2020.</p>
        </div>
      </div>

      {/* ── Form (sesuai gambar) ───────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h2 className="text-sm font-semibold text-gray-800">{editId ? '✏️ Edit ANJAB' : 'Form Tambah Jabatan'}</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-5">
            {error && <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

            {/* Layout tabel 2 kolom label:value seperti gambar */}
            <table className="w-full text-sm mb-4">
              <tbody className="divide-y divide-gray-50">
                {/* Induk Jabatan */}
                <tr>
                  <td className="py-2 pr-4 w-40"><label className={labelCls}>Induk Jabatan</label></td>
                  <td className="py-2">
                    <select className={inputCls} {...register('indukJabatan')}>
                      <option value="">--- Pilih Induk Jabatan ---</option>
                      {jabatanList.map(j => <option key={j.id} value={j.nama}>{j.nama}</option>)}
                    </select>
                  </td>
                </tr>
                {/* Unit Organisasi */}
                <tr>
                  <td className="py-2 pr-4"><label className={labelCls}>Unit Organisasi</label></td>
                  <td className="py-2">
                    <select className={inputCls} {...register('unitOrganisasi')}>
                      <option value="">--- Pilih Unit ---</option>
                      {unitList.map(u => <option key={u.id} value={u.nama}>{u.nama}</option>)}
                    </select>
                  </td>
                </tr>
                {/* Jenis Jabatan */}
                <tr>
                  <td className="py-2 pr-4"><label className={labelCls}>Jenis Jabatan</label></td>
                  <td className="py-2">
                    <select className={inputCls} {...register('jenisJabatan')}>
                      <option value="">--- Pilih Jenis Jabatan ---</option>
                      {JENIS_JABATAN.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </td>
                </tr>
                {/* Nama Jabatan */}
                <tr>
                  <td className="py-2 pr-4"><label className={labelCls}>Nama Jabatan <span className="text-red-500">*</span></label></td>
                  <td className="py-2">
                    <input type="text" placeholder="Nama jabatan..."
                      className={`${inputCls} ${errors.namaJabatan ? 'border-red-400' : ''}`}
                      {...register('namaJabatan', { required: 'Wajib diisi' })} />
                    {errors.namaJabatan && <p className="text-xs text-red-500 mt-1">{errors.namaJabatan.message}</p>}
                  </td>
                </tr>
                {/* Nama Urusan */}
                <tr>
                  <td className="py-2 pr-4"><label className={labelCls}>Nama Urusan</label></td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 min-h-[38px]">
                        {namaUrusan || <span className="text-gray-400">—</span>}
                      </span>
                      <button type="button" onClick={() => setUrusanModal(true)}
                        className="flex-shrink-0 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        Pilih Urusan
                      </button>
                    </div>
                    <input type="hidden" {...register('namaUrusan')} />
                  </td>
                </tr>
                {/* Kode Jabatan */}
                <tr>
                  <td className="py-2 pr-4"><label className={labelCls}>Kode Jabatan</label></td>
                  <td className="py-2">
                    <div className="flex gap-3">
                      <input type="text" placeholder="2.04.2.53301590.1"
                        className={inputCls} {...register('kodeJabatan')} />
                      <input type="number" placeholder="Tahun" min="2020" max="2030"
                        className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register('tahun', { required: true })} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Syarat Jabatan */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Syarat Jabatan</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Terendah */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pangkat/Golongan Ruang Terendah</label>
                    <select className={inputCls} {...register('pangkatTerendah')}>
                      <option value="">--- Pilih Pangkat/Gol ---</option>
                      {PANGKAT_GOL.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pendidikan Terendah</label>
                    <select className={inputCls} {...register('pendidikanTerendah')}>
                      <option value="">--- Pilih Pendidikan ---</option>
                      {PENDIDIKAN.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Jurusan</label>
                    <input type="text" placeholder="jurusan..." className={inputCls} {...register('jurusanTerendah')} />
                  </div>
                </div>
                {/* Tertinggi */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pangkat/Golongan Ruang Tertinggi</label>
                    <select className={inputCls} {...register('pangkatTertinggi')}>
                      <option value="">--- Pilih Pangkat/Gol ---</option>
                      {PANGKAT_GOL.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pendidikan Tertinggi</label>
                    <select className={inputCls} {...register('pendidikanTertinggi')}>
                      <option value="">--- Pilih Pendidikan ---</option>
                      {PENDIDIKAN.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Jurusan</label>
                    <input type="text" placeholder="jurusan..." className={inputCls} {...register('jurusanTertinggi')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Detail ANJAB */}
            <details className="border border-gray-200 rounded-lg mb-4">
              <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 rounded-lg">
                Detail ANJAB (Ikhtisar, Tugas Pokok, dll)
              </summary>
              <div className="p-4 space-y-3 border-t border-gray-100">
                {[
                  { key: 'ikhtisar', label: 'Ikhtisar Jabatan' },
                  { key: 'tugasPokok', label: 'Tugas Pokok' },
                  { key: 'hasilKerja', label: 'Hasil Kerja' },
                  { key: 'tanggungjawab', label: 'Tanggung Jawab' },
                  { key: 'wewenang', label: 'Wewenang' },
                  { key: 'kualifikasi', label: 'Kualifikasi Jabatan' },
                  { key: 'syaratJabatan', label: 'Syarat Jabatan' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                    <textarea rows={2} placeholder={f.label}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      {...register(f.key as any)} />
                  </div>
                ))}
              </div>
            </details>

            {/* Tombol */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Batal</button>
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {saving ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Menyimpan...</> : `💾 ${editId ? 'Update' : 'Simpan'}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabel ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Data ANJAB & ABK</h2>
              <p className="text-xs text-gray-400 mt-0.5">{data.length} jabatan terdaftar</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFormDOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                <FileText size={13} /> Form D (ABK)
              </button>
              {!showForm && (
                <button onClick={openAdd}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                  <Plus size={14} /> Tambah Jabatan
                </button>
              )}
            </div>
          </div>
          {/* Filter OPD */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">Pilih OPD</label>
            {role === 'ADMIN_PUSAT' ? (
              <select value={selectedOPD} onChange={e => { setSelectedOPD(e.target.value); setPage(1) }}
                className="flex-1 max-w-lg px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Semua OPD —</option>
                {sekolahList.map(s => <option key={s.id} value={s.id}>[{s.npsn}] {s.nama}</option>)}
              </select>
            ) : (
              <div className="flex-1 max-w-lg px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                {selectedOPDNama || 'Sekolah Anda'}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tampilkan</span>
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }} className="px-2 py-1 border border-gray-300 rounded text-sm bg-white">
                {[10,15,25,50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cari nama jabatan..."
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><ClipboardList size={40} className="mx-auto text-gray-200 mb-2" /><p className="text-sm text-gray-400">{search ? 'Tidak ada data yang cocok' : 'Belum ada data ANJAB'}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['No','Kode Jabatan','Nama Jabatan','Jenis','Urusan','Pangkat Min','Pendidikan Min','ABK','Aksi'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((item, idx) => {
                  const hasAbk = (item.abk ?? []).length > 0
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${editId === item.id ? 'bg-blue-50' : ''}`}>
                      <td className="px-3 py-3 text-gray-400 text-xs">{(page-1)*rowsPerPage+idx+1}</td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-600">{item.kodeJabatan ?? '—'}</td>
                      <td className="px-3 py-3 font-medium text-gray-900">{item.namaJabatan}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{item.jenisJabatan ?? '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{item.namaUrusan ?? '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{item.pangkatTerendah ?? '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{item.pendidikanTerendah ?? '—'}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${hasAbk ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                          {hasAbk ? `${(item.abk ?? []).length} data` : 'Belum ada'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Edit"><Pencil size={13}/></button>
                          <Link href={`/anjab/${item.id}`} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 inline-flex" title="Detail ABK"><Eye size={13}/></Link>
                          <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Hapus"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Menampilkan {(page-1)*rowsPerPage+1}–{Math.min(page*rowsPerPage,filtered.length)} dari {filtered.length} entri</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">← Previous</button>
              {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).reduce<(number|'...')[]>((acc,p,i,arr)=>{ if(i>0&&p-(arr[i-1] as number)>1) acc.push('...'); acc.push(p); return acc },[]).map((p,i)=>p==='...'?<span key={`e${i}`} className="px-2 text-xs text-gray-400">…</span>:<button key={p} onClick={()=>setPage(p as number)} className={`px-3 py-1.5 text-xs border rounded-lg ${page===p?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50'}`}>{p}</button>)}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Hapus */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-600 mb-5">Yakin hapus data ANJAB ini?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}

      <UrusanModal open={urusanModal} onClose={() => setUrusanModal(false)} onSave={(v: string) => setValue('namaUrusan', v)} current={namaUrusan} />
      <FormDModal open={formDOpen} onClose={() => setFormDOpen(false)} jabatanList={data} opd={selectedOPDNama} />
    </div>
  )
}