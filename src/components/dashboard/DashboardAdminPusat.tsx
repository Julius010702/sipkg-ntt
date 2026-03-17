'use client'
import { useState, useEffect, useCallback } from 'react'
import { StatCard, Card, CardHeader, CardBody } from '@/components/ui'
import { School, Users, AlertTriangle, TrendingUp, Clock, ChevronDown, ChevronUp, AlignJustify } from 'lucide-react'
import Link from 'next/link'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { RealtimeClock } from './RealtimeClock'

// ── Types ─────────────────────────────────────────────────────────────────────
interface SekolahOption {
  id: string
  nama: string
  npsn: string
}

interface GuruStats {
  totalGuru: number
  totalPNS: number
  totalNonPNS: number
  totalDibutuhkan: number
  totalAda: number
  totalKekurangan: number
  totalKelebihan: number
}

interface Props {
  stats: {
    totalSekolah: number
    totalSMA: number
    totalSMK: number
    totalSLB: number
    totalGuruDibutuhkan: number
    totalGuruAda: number
    totalKekurangan: number
    totalKelebihan: number
    sekolahBelumHitung: number
    tahunAjaran: string
    // Tambahan untuk PNS/NonPNS — bisa null jika API belum support
    totalPNS?: number
    totalNonPNS?: number
  }
  sekolahList?: SekolahOption[]  // daftar sekolah untuk dropdown OPD
}

// ── Warna chart ───────────────────────────────────────────────────────────────
const SEKOLAH_COLORS = ['#C0272D', '#D4A017', '#378ADD']
const PNS_COLORS     = ['#378ADD', '#555555']   // PNS biru, NonPNS abu
const KEBUTUHAN_COLORS = ['#378ADD', '#C0272D'] // Ada biru, Kekurangan merah

// ── Custom label di dalam pie (persentase) ────────────────────────────────────
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (percent < 0.04) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  )
}

// Juga label luar
const renderOuterLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  if (percent < 0.04) return null
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 22
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#555" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
      {`${name}: ${(percent * 100).toFixed(1)} %`}
    </text>
  )
}

// ── Chart card dengan collapse ────────────────────────────────────────────────
function ChartCard({ title, subtitle, badge, children }: {
  title: string; subtitle?: string; badge?: string; children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <AlignJustify size={14} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {badge && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">{badge}</span>
          )}
        </div>
        <button onClick={() => setCollapsed(c => !c)} className="text-gray-400 hover:text-gray-600 transition-colors">
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
      {!collapsed && (
        <div className="p-5">
          {subtitle && <p className="text-xs text-gray-400 mb-3">{subtitle}</p>}
          {children}
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function DashboardAdminPusat({ stats, sekolahList = [] }: Props) {
  // Filter OPD
  const [selectedOPD, setSelectedOPD] = useState<string>('') // '' = Seluruh OPD
  const [guruStats, setGuruStats] = useState<GuruStats>({
    totalGuru: stats.totalGuruAda + (stats.totalNonPNS ?? 0),
    totalPNS: stats.totalPNS ?? Math.round(stats.totalGuruAda * 0.595),
    totalNonPNS: stats.totalNonPNS ?? Math.round(stats.totalGuruAda * 0.405),
    totalDibutuhkan: stats.totalGuruDibutuhkan,
    totalAda: stats.totalGuruAda,
    totalKekurangan: stats.totalKekurangan,
    totalKelebihan: stats.totalKelebihan,
  })
  const [loadingFilter, setLoadingFilter] = useState(false)

  // Fetch ulang stats saat filter OPD berubah
  const fetchFilteredStats = useCallback(async (sekolahId: string) => {
    if (!sekolahId) {
      // Reset ke data global
      setGuruStats({
        totalGuru: stats.totalGuruAda,
        totalPNS: stats.totalPNS ?? Math.round(stats.totalGuruAda * 0.595),
        totalNonPNS: stats.totalNonPNS ?? Math.round(stats.totalGuruAda * 0.405),
        totalDibutuhkan: stats.totalGuruDibutuhkan,
        totalAda: stats.totalGuruAda,
        totalKekurangan: stats.totalKekurangan,
        totalKelebihan: stats.totalKelebihan,
      })
      return
    }
    setLoadingFilter(true)
    try {
      const res = await fetch(`/api/dashboard/guru-stats?sekolahId=${sekolahId}`)
      if (res.ok) {
        const json = await res.json()
        setGuruStats(json.data)
      }
    } catch { /* silent */ }
    finally { setLoadingFilter(false) }
  }, [stats])

  useEffect(() => { fetchFilteredStats(selectedOPD) }, [selectedOPD, fetchFilteredStats])

  // ── Data chart ──────────────────────────────────────────────────────────────
  const sekolahChartData = [
    { name: 'SMA', sekolah: stats.totalSMA },
    { name: 'SMK', sekolah: stats.totalSMK },
    { name: 'SLB', sekolah: stats.totalSLB },
  ]

  const pnsChartData = [
    { name: 'PNS',    value: guruStats.totalPNS    },
    { name: 'NonPNS', value: guruStats.totalNonPNS },
  ]

  const kebutuhanChartData = [
    { name: 'Pegawai Ada',    value: guruStats.totalAda       },
    { name: 'Kekurangan',     value: guruStats.totalKekurangan },
  ]

  const totalPegawai = guruStats.totalPNS + guruStats.totalNonPNS
  const pnsPct   = totalPegawai > 0 ? ((guruStats.totalPNS    / totalPegawai) * 100).toFixed(1) : '0'
  const nonPnsPct = totalPegawai > 0 ? ((guruStats.totalNonPNS / totalPegawai) * 100).toFixed(1) : '0'

  const totalKebutuhan = guruStats.totalDibutuhkan || 1
  const adaPct    = ((guruStats.totalAda        / totalKebutuhan) * 100).toFixed(1)
  const kurangPct = ((guruStats.totalKekurangan / totalKebutuhan) * 100).toFixed(1)

  // Nama OPD terpilih
  const selectedNama = selectedOPD
    ? sekolahList.find(s => s.id === selectedOPD)?.nama ?? 'OPD Dipilih'
    : 'Seluruh OPD'

  return (
    <div className="space-y-6">

      <RealtimeClock />

      {/* Statistik Sekolah */}
      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          <span className="inline-block h-[2px] w-4 rounded-full bg-[#C0272D]" />
          Statistik Sekolah
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total Sekolah"  value={stats.totalSekolah} icon={<School size={22} />} color="blue" />
          <StatCard label="SMA"            value={stats.totalSMA}     icon={<School size={22} />} color="purple" />
          <StatCard label="SMK"            value={stats.totalSMK}     icon={<School size={22} />} color="green" />
          <StatCard label="SLB"            value={stats.totalSLB}     icon={<School size={22} />} color="yellow" />
        </div>
      </div>

      {/* Statistik Guru */}
      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          <span className="inline-block h-[2px] w-4 rounded-full bg-[#C0272D]" />
          Rekap Kebutuhan Guru
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Guru Ada"        value={stats.totalGuruAda}       icon={<Users size={22} />}         color="blue" />
          <StatCard label="Guru Dibutuhkan" value={stats.totalGuruDibutuhkan} icon={<TrendingUp size={22} />}    color="green" />
          <StatCard label="Kekurangan Guru" value={stats.totalKekurangan}     icon={<AlertTriangle size={22} />} color={stats.totalKekurangan > 0 ? 'red' : 'green'} />
          <StatCard label="Belum Hitung"    value={stats.sekolahBelumHitung}  icon={<Clock size={22} />}         color={stats.sekolahBelumHitung > 0 ? 'yellow' : 'green'} subtitle="sekolah" />
        </div>
      </div>

      {/* Alert */}
      {stats.sekolahBelumHitung > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{stats.sekolahBelumHitung} sekolah</span> belum melakukan perhitungan kebutuhan guru pada tahun ajaran ini.
          </p>
        </div>
      )}

      {/* ── Dua Chart dengan filter OPD masing-masing ─────────────────────── */}
      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          <span className="inline-block h-[2px] w-4 rounded-full bg-[#C0272D]" />
          Visualisasi Data
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Chart 1 — Jumlah Pegawai (PNS vs NonPNS) */}
          <ChartCard title="Jumlah Pegawai">
            {/* Filter OPD */}
            <div className="mb-3">
              <select
                value={selectedOPD}
                onChange={e => setSelectedOPD(e.target.value)}
                disabled={loadingFilter}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                <option value="">Seluruh OPD</option>
                {sekolahList.map(s => (
                  <option key={s.id} value={s.id}>{s.nama}</option>
                ))}
              </select>
            </div>

            <p className="text-sm font-semibold text-center text-gray-700 mb-0.5">Kebutuhan Pegawai</p>
            <p className="text-xs text-center text-gray-400 mb-4">
              Jumlah Pegawai : {loadingFilter ? '...' : totalPegawai.toLocaleString('id-ID')}
            </p>

            {loadingFilter ? (
              <div className="flex justify-center py-16">
                <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pnsChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={2}
                    labelLine={false}
                    label={({ cx, cy, midAngle, outerRadius, percent, name }) => {
                      const RADIAN = Math.PI / 180
                      const radius = outerRadius + 28
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
                      const y = cy + radius * Math.sin(-midAngle * RADIAN)
                      if (percent < 0.04) return null
                      return (
                        <text x={x} y={y} fill="#444" textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central" fontSize={11}>
                          {`${name}: ${(percent * 100).toFixed(1)} %`}
                        </text>
                      )
                    }}
                  >
                    {pnsChartData.map((_, i) => (
                      <Cell key={i} fill={PNS_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString('id-ID')} (${totalPegawai > 0 ? ((value / totalPegawai) * 100).toFixed(1) : 0}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Legend */}
            <div className="flex justify-center gap-5 mt-2">
              {pnsChartData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: PNS_COLORS[i] }} />
                  {d.name} ({totalPegawai > 0 ? ((d.value / totalPegawai) * 100).toFixed(1) : 0}%)
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Chart 2 — Kebutuhan Pegawai (Ada vs Kekurangan) */}
          <ChartCard title="Kebutuhan Pegawai">
            {/* Filter OPD — sync dengan chart 1 */}
            <div className="mb-3">
              <select
                value={selectedOPD}
                onChange={e => setSelectedOPD(e.target.value)}
                disabled={loadingFilter}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                <option value="">Seluruh OPD</option>
                {sekolahList.map(s => (
                  <option key={s.id} value={s.id}>{s.nama}</option>
                ))}
              </select>
            </div>

            <p className="text-sm font-semibold text-center text-gray-700 mb-0.5">Kebutuhan Pegawai</p>
            <p className="text-xs text-center text-gray-400 mb-4">
              Jumlah Pegawai PNS : {loadingFilter ? '...' : guruStats.totalPNS.toLocaleString('id-ID')}
            </p>

            {loadingFilter ? (
              <div className="flex justify-center py-16">
                <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={kebutuhanChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ cx, cy, midAngle, outerRadius, percent, name, value }) => {
                      const RADIAN = Math.PI / 180
                      const radius = outerRadius + 28
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
                      const y = cy + radius * Math.sin(-midAngle * RADIAN)
                      if (percent < 0.03) return null
                      return (
                        <text x={x} y={y} fill={percent < 0 ? '#C0272D' : '#555'}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central" fontSize={11}
                          className="cursor-pointer hover:underline"
                        >
                          {`${(percent * 100).toFixed(1)} %`}
                        </text>
                      )
                    }}
                  >
                    {kebutuhanChartData.map((_, i) => (
                      <Cell key={i} fill={KEBUTUHAN_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString('id-ID')} (${totalKebutuhan > 0 ? ((value / totalKebutuhan) * 100).toFixed(1) : 0}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Legend */}
            <div className="flex justify-center gap-5 mt-2">
              {kebutuhanChartData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: KEBUTUHAN_COLORS[i] }} />
                  {d.name} ({totalKebutuhan > 0 ? ((d.value / totalKebutuhan) * 100).toFixed(1) : 0}%)
                </div>
              ))}
            </div>
          </ChartCard>

        </div>
      </div>

      {/* Pie chart distribusi sekolah (tetap ada) */}
      <div className="grid grid-cols-1">
        <ChartCard
          title="Distribusi Sekolah per Jenis"
          subtitle="SMA · SMK · SLB aktif se-NTT"
          badge={`${stats.totalSekolah} total`}
        >
          <div className="mb-3 flex flex-wrap gap-3 text-[12px] text-gray-500">
            {sekolahChartData.map((item, index) => (
              <span key={item.name} className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SEKOLAH_COLORS[index] }} />
                {item.name} ({item.sekolah})
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sekolahChartData}
                dataKey="sekolah"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {sekolahChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={SEKOLAH_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quick Links */}
      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          <span className="inline-block h-[2px] w-4 rounded-full bg-[#C0272D]" />
          Menu Cepat
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { href: '/data-sekolah',     label: 'Data Sekolah',     icon: '🏫', desc: 'Kelola semua sekolah' },
            { href: '/monitoring',       label: 'Monitoring',       icon: '📊', desc: 'Pantau kebutuhan guru' },
            { href: '/anjab',            label: 'ANJAB & ABK',      icon: '📋', desc: 'Analisis jabatan' },
            { href: '/laporan-provinsi', label: 'Laporan Provinsi', icon: '📑', desc: 'Rekap NTT' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C0272D]/20 hover:shadow-md">
                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF0F0] text-2xl transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}