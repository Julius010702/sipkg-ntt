'use client'
// src/app/(dashboard)/anjab/page.tsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Pencil, Trash2, ClipboardList, Eye, Printer, FileText } from 'lucide-react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

const WAKTU_EFEKTIF = 75000

// ── Form D cetak ──────────────────────────────────────────────────────────────
function FormDModal({ open, onClose, jabatanList, opd }: {
  open: boolean; onClose: () => void; jabatanList: any[]; opd: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6">
      <div className="bg-white rounded-xl shadow-xl w-[1000px] mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">
            Form D — Perhitungan Kebutuhan Pegawai
          </h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              <Printer size={14} /> Cetak
            </button>
            <button onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Tutup</button>
          </div>
        </div>
        <div className="p-8">
          <div className="text-center mb-6">
            <p className="font-bold text-sm uppercase">PEMERINTAH PROVINSI NUSA TENGGARA TIMUR</p>
            <p className="text-xs mt-1">FORM D - PERHITUNGAN KEBUTUHAN PEJABAT/PEGAWAI, TINGKAT EFISIENSI JABATAN (EJ) DAN PRESTASI KERJA JABATAN (PJ)</p>
            {opd && <p className="text-xs mt-2 font-semibold uppercase">UNIT KERJA PERANGKAT DAERAH {opd}</p>}
          </div>
          <table className="w-full text-xs border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>No</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>Nama Jabatan</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>Jumlah Beban Kerja Jabatan</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>Perhitungan Jumlah Kebutuhan Pegawai</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>Jumlah Pegawai ASN</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>Jumlah Pegawai PPPK</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>+/-</th>
                <th className="border border-gray-400 px-2 py-2 text-center" colSpan={2}>Kebutuhan Pegawai</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>EJ</th>
                <th className="border border-gray-400 px-2 py-2 text-center" rowSpan={2}>PJ</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-2 py-1 text-center">Kurang</th>
                <th className="border border-gray-400 px-2 py-1 text-center">Lebih</th>
              </tr>
              <tr className="bg-gray-50 text-gray-400">
                {[1,2,3,4,5,6,7,8,9,10,11].map(n => (
                  <th key={n} className="border border-gray-400 px-1 py-1 text-center">{n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jabatanList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="border border-gray-400 px-3 py-8 text-center text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : jabatanList.map((item, idx) => {
                const abk             = item.abk ?? []
                const jumlahBeban     = abk.reduce((s: number, a: any) => s + (a.waktePenyelesaian ?? (a.volumeBebanKerja * a.normaWaktu)), 0)
                const kebutuhanPegawai = abk.length > 0
                  ? abk.reduce((s: number, a: any) => s + Math.ceil(Number(a.pegawaiDibutuhkan)), 0)
                  : Math.ceil(jumlahBeban / WAKTU_EFEKTIF)
                const jumlahASN       = abk.reduce((s: number, a: any) => s + (a.pegawaiAda ?? 0), 0)
                const jumlahPPPK      = abk.reduce((s: number, a: any) => s + (a.pegawaiPPPK ?? 0), 0)
                const selisih         = jumlahASN + jumlahPPPK - kebutuhanPegawai
                const kurang          = selisih < 0 ? Math.abs(selisih) : 0
                const lebih           = selisih > 0 ? selisih : 0
                const ej              = kebutuhanPegawai > 0 ? (jumlahASN / kebutuhanPegawai) : 0
                const pjLabel         = ej >= 1.0 ? 'A (Sangat Baik)' : ej >= 0.9 ? 'B (Baik)' : ej >= 0.7 ? 'C (Cukup)' : 'D (Sedang)'
                const rowBg           = kurang > 0 ? 'bg-red-50' : lebih > 0 ? 'bg-yellow-50' : ''

                return (
                  <tr key={item.id} className={rowBg}>
                    <td className="border border-gray-400 px-2 py-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-400 px-2 py-2 font-medium">{item.namaJabatan}</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">{jumlahBeban.toLocaleString('id-ID')}</td>
                    <td className="border border-gray-400 px-2 py-2 text-center">{kebutuhanPegawai}</td>
                    <td className="border border-gray-400 px-2 py-2 text-center">{jumlahASN}</td>
                    <td className="border border-gray-400 px-2 py-2 text-center">{jumlahPPPK}</td>
                    <td className={`border border-gray-400 px-2 py-2 text-center font-semibold ${selisih < 0 ? 'text-red-600' : selisih > 0 ? 'text-yellow-600' : ''}`}>
                      {selisih}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-center text-red-700">
                      {kurang > 0 ? `${kurang} Orang` : ''}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-center text-yellow-700">
                      {lebih > 0 ? `${lebih} Orang` : ''}
                    </td>
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

  const [data, setData]                 = useState<any[]>([])
  const [sekolahList, setSekolahList]   = useState<any[]>([])
  const [selectedOPD, setSelectedOPD]   = useState<string>(userSekolahId ?? '')
  const [loading, setLoading]           = useState(true)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editId, setEditId]             = useState<string | null>(null)
  const [deleteId, setDeleteId]         = useState<string | null>(null)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [formDOpen, setFormDOpen]       = useState(false)
  const [search, setSearch]             = useState('')
  const [rowsPerPage, setRowsPerPage]   = useState(15)
  const [page, setPage]                 = useState(1)

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (role === 'ADMIN_PUSAT') {
      fetch('/api/sekolah?statusAktif=AKTIF')
        .then(r => r.json())
        .then(j => setSekolahList(j.data ?? []))
        .catch(() => {})
    }
  }, [role])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = selectedOPD ? `?sekolahId=${selectedOPD}` : ''
      const res    = await fetch(`/api/anjab${params}`)
      const json   = await res.json()
      const list   = json.data ?? []
      // Fetch ABK untuk tiap anjab agar Form D bisa dihitung
      const withAbk = await Promise.all(list.map(async (a: any) => {
        try {
          const r = await fetch(`/api/anjab/${a.id}/abk`)
          const j = await r.json()
          return { ...a, abk: j.data ?? [] }
        } catch { return { ...a, abk: [] } }
      }))
      setData(withAbk)
    } catch { setError('Gagal memuat data') }
    finally { setLoading(false) }
  }, [selectedOPD])

  useEffect(() => { fetchData() }, [fetchData])

  const openAdd  = () => { reset({ tahun: new Date().getFullYear() }); setEditId(null); setModalOpen(true); setError('') }
  const openEdit = (item: any) => { reset(item); setEditId(item.id); setModalOpen(true); setError('') }

  const onSubmit = async (fd: any) => {
    setSaving(true); setError('')
    try {
      const url    = editId ? `/api/anjab/${editId}` : '/api/anjab'
      const method = editId ? 'PUT' : 'POST'
      const payload = { ...fd, tahun: parseInt(fd.tahun) }
      if (selectedOPD) payload.sekolahId = selectedOPD
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Gagal menyimpan'); return }
      setModalOpen(false); fetchData()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/anjab/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null); fetchData()
  }

  const selectedOPDNama = sekolahList.find(s => s.id === selectedOPD)?.nama ?? ''

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter(d =>
      d.namaJabatan.toLowerCase().includes(q) ||
      (d.kodeJabatan ?? '').toLowerCase().includes(q)
    )
  }, [data, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <ClipboardList size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Analisis Jabatan (ANJAB) & Analisis Beban Kerja (ABK)</p>
          <p className="text-xs text-blue-600 mt-0.5">Sesuai Permenpan-RB No. 1 Tahun 2020. Form D ABK tersedia untuk cetak.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header toolbar */}
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
              <button onClick={openAdd}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                <Plus size={14} /> Tambah Jabatan
              </button>
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

          {/* Rows + search */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tampilkan</span>
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                className="px-2 py-1 border border-gray-300 rounded text-sm bg-white">
                {[10,15,25,50].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <input type="text" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
              placeholder="Cari nama jabatan..."
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
          </div>
        </div>

        {/* Tabel */}
        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList size={40} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">{search ? 'Tidak ada data yang cocok' : 'Belum ada data ANJAB'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-3 text-center font-semibold text-gray-500 uppercase w-10 whitespace-nowrap">No</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase whitespace-nowrap">Kode Jabatan</th>
                  <th className="px-2 py-3 text-center font-semibold text-gray-500 uppercase w-8">#</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase">Nama Jabatan</th>
                  {/* ANJAB group */}
                  <th className="px-2 py-2 text-center font-semibold text-gray-500 border-l border-gray-200" colSpan={5}>ANJAB</th>
                  {/* ABK group */}
                  <th className="px-2 py-2 text-center font-semibold text-gray-500 border-l border-gray-200" colSpan={6}>ABK</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-500 uppercase w-16">Aksi</th>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50/60 text-[11px]">
                  <th colSpan={4}/>
                  {/* ANJAB sub */}
                  <th className="px-2 py-2 text-center text-gray-500 border-l border-gray-200 w-14">%</th>
                  <th className="px-2 py-2 text-center text-gray-500 w-8">✓</th>
                  <th className="px-1 py-2 text-center text-gray-500">BKN</th>
                  <th className="px-1 py-2 text-center text-gray-500">Permendagri</th>
                  <th className="px-1 py-2 text-center text-gray-500">Permenpan</th>
                  {/* ABK sub */}
                  <th className="px-2 py-2 text-center text-gray-500 border-l border-gray-200 w-14">%</th>
                  <th className="px-2 py-2 text-center text-gray-500 w-8">✓</th>
                  <th className="px-1 py-2 text-center text-gray-500">Form A</th>
                  <th className="px-1 py-2 text-center text-gray-500">Form B</th>
                  <th className="px-1 py-2 text-center text-gray-500">Form C</th>
                  <th className="px-1 py-2 text-center text-gray-500">Form D</th>
                  <th/>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((item, idx) => {
                  const hasAbk   = (item.abk ?? []).length > 0
                  const anjabFilled = !!(item.ikhtisar && item.tugasPokok && item.hasilKerja)
                  const anjabPct = anjabFilled ? '100%' : item.namaJabatan ? '50%' : '0%'
                  const abkPct   = hasAbk ? '100%' : '0%'

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 text-center text-gray-400">{(page-1)*rowsPerPage+idx+1}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-600 whitespace-nowrap">
                        {item.kodeJabatan ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <button onClick={() => openEdit(item)}
                          className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 mx-auto">
                          <Pencil size={10} />
                        </button>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 text-sm">{item.namaJabatan}</td>

                      {/* ANJAB */}
                      <td className="px-2 py-2.5 text-center border-l border-gray-100">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${anjabPct === '100%' ? 'bg-green-100 text-green-700' : anjabPct === '50%' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                          {anjabPct}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" readOnly defaultChecked={anjabFilled} />
                      </td>
                      {/* BKN */}
                      <td className="px-1 py-2.5 text-center">
                        <button className="w-7 h-7 rounded bg-green-500 text-white flex items-center justify-center hover:bg-green-600 mx-auto" title="Cetak BKN">
                          <Printer size={11} />
                        </button>
                      </td>
                      {/* Permendagri */}
                      <td className="px-1 py-2.5 text-center">
                        <div className="flex gap-0.5 justify-center">
                          <button className="w-7 h-7 rounded bg-green-500 text-white flex items-center justify-center hover:bg-green-600" title="Cetak Permendagri">
                            <Printer size={11} />
                          </button>
                          <button className="w-7 h-7 rounded bg-green-600 text-white flex items-center justify-center hover:bg-green-700" title="Export Excel Permendagri">
                            <FileText size={11} />
                          </button>
                        </div>
                      </td>
                      {/* Permenpan */}
                      <td className="px-1 py-2.5 text-center">
                        <div className="flex gap-0.5 justify-center">
                          <button className="w-7 h-7 rounded bg-green-500 text-white flex items-center justify-center hover:bg-green-600" title="Cetak Permenpan">
                            <Printer size={11} />
                          </button>
                          <button className="w-7 h-7 rounded bg-green-700 text-white flex items-center justify-center hover:bg-green-800" title="Export Excel Permenpan">
                            <FileText size={11} />
                          </button>
                        </div>
                      </td>

                      {/* ABK */}
                      <td className="px-2 py-2.5 text-center border-l border-gray-100">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${hasAbk ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                          {abkPct}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" readOnly defaultChecked={hasAbk} />
                      </td>
                      {/* Form A B C D */}
                      {(['Form A','Form B','Form C','Form D'] as const).map(f => (
                        <td key={f} className="px-1 py-2.5 text-center">
                          {hasAbk ? (
                            <button
                              onClick={f === 'Form D' ? () => setFormDOpen(true) : undefined}
                              title={`Cetak ${f}`}
                              className="w-7 h-7 rounded bg-green-500 text-white flex items-center justify-center hover:bg-green-600 mx-auto">
                              <Printer size={11} />
                            </button>
                          ) : (
                            <span className="text-gray-200">—</span>
                          )}
                        </td>
                      ))}

                      {/* Aksi */}
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1 justify-center">
                          <Link href={`/anjab/${item.id}`}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 inline-flex" title="Detail & ABK">
                            <Eye size={14} />
                          </Link>
                          <button onClick={() => setDeleteId(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Menampilkan {(page-1)*rowsPerPage+1}–{Math.min(page*rowsPerPage,filtered.length)} dari {filtered.length} entri
            </p>
            <div className="flex gap-1">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">← Previous</button>
              {Array.from({length:totalPages},(_,i)=>i+1)
                .filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1)
                .reduce<(number|'...')[]>((acc,p,i,arr)=>{
                  if(i>0&&p-(arr[i-1] as number)>1) acc.push('...')
                  acc.push(p); return acc
                },[])
                .map((p,i)=>p==='...'
                  ?<span key={`e${i}`} className="px-2 text-xs text-gray-400">…</span>
                  :<button key={p} onClick={()=>setPage(p as number)}
                      className={`px-3 py-1.5 text-xs border rounded-lg ${page===p?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50'}`}>{p}</button>
                )}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-[640px] mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editId ? 'Edit ANJAB' : 'Tambah ANJAB Baru'}</h3>
              <button onClick={()=>setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <form id="anjab-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jabatan *</label>
                    <input type="text" placeholder="Guru Mata Pelajaran"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('namaJabatan',{required:true})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun *</label>
                    <input type="number" min="2020" max="2030"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('tahun',{required:true})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Jabatan</label>
                    <input type="text" placeholder="2.04.2.53301590.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('kodeJabatan')} />
                  </div>
                </div>
                {[
                  {key:'ikhtisar',label:'Ikhtisar Jabatan'},
                  {key:'tugasPokok',label:'Tugas Pokok'},
                  {key:'hasilKerja',label:'Hasil Kerja'},
                  {key:'tanggungjawab',label:'Tanggung Jawab'},
                  {key:'wewenang',label:'Wewenang'},
                  {key:'kualifikasi',label:'Kualifikasi Jabatan'},
                  {key:'syaratJabatan',label:'Syarat Jabatan'},
                ].map(f=>(
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <textarea rows={2} placeholder={f.label}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register(f.key as any)} />
                  </div>
                ))}
              </form>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button type="button" onClick={()=>setModalOpen(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
              <button form="anjab-form" type="submit" disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {saving?'Menyimpan...':'💾 Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-600 mb-5">Yakin hapus data ANJAB ini? Data ABK terkait juga akan dihapus.</p>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Form D */}
      <FormDModal open={formDOpen} onClose={()=>setFormDOpen(false)} jabatanList={data} opd={selectedOPDNama} />
    </div>
  )
}