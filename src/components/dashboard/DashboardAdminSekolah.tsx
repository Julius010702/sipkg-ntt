'use client'
import { StatCard, Card, CardHeader, CardBody, Badge, Alert } from '@/components/ui'
import { GraduationCap, Users, BookOpen, AlertTriangle, CheckCircle, GitBranch, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { RealtimeClock } from './RealtimeClock'

interface JabatanUnit {
  id: string
  jumlahFormasi: number
  jabatan: { id: string; nama: string; kode: string }
}

interface UnitNode {
  id: string
  nama: string
  kode: string | null
  jabatan: JabatanUnit[]
  children: UnitNode[]
}

interface Props {
  sekolah: any
  stats: {
    totalGuru: number
    totalRombel: number
    guruDibutuhkan: number
    kekurangan: number
    kelebihan: number
    sudahHitung: boolean
    tahunAjaran: string
  }
  baganOrganisasi: UnitNode[]
  guruMap: Record<string, number>
}

const levelConfig = [
  { bg: 'bg-blue-600', border: 'border-blue-700', text: 'text-white', sub: 'text-blue-200' },
  { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-white', sub: 'text-emerald-200' },
  { bg: 'bg-white', border: 'border-gray-300', text: 'text-gray-800', sub: 'text-gray-500' },
]

function JabatanRow({
  nama, formasi, ada, dark,
}: {
  nama: string; formasi: number; ada: number; dark: boolean
}) {
  const kurang = Math.max(0, formasi - ada)
  const lebih = Math.max(0, ada - formasi)
  return (
    <div className={`flex items-center justify-between gap-1 px-2 py-1 rounded-lg text-[11px] mt-1 ${dark ? 'bg-white/10' : 'bg-gray-50 border border-gray-100'}`}>
      <span className={`truncate flex-1 font-medium ${dark ? 'text-white' : 'text-gray-700'}`}>{nama}</span>
      <div className="flex gap-1 flex-shrink-0 items-center">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${dark ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>F:{formasi}</span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${ada >= formasi ? (dark ? 'bg-green-400/30 text-green-100' : 'bg-green-100 text-green-700') : (dark ? 'bg-red-400/30 text-red-100' : 'bg-red-100 text-red-700')}`}>A:{ada}</span>
        {kurang > 0 && <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${dark ? 'bg-red-500/40 text-red-100' : 'bg-red-100 text-red-700'}`}>-{kurang}</span>}
        {lebih > 0 && <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${dark ? 'bg-yellow-400/30 text-yellow-100' : 'bg-yellow-100 text-yellow-700'}`}>+{lebih}</span>}
      </div>
    </div>
  )
}

function UnitCard({ unit, level = 0, guruMap }: { unit: UnitNode; level?: number; guruMap: Record<string, number> }) {
  const cfg = levelConfig[Math.min(level, 2)]
  const isDark = level < 2
  const hasChildren = unit.children.length > 0
  const childGap = 224 // px, lebar node + gap

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div className={`${cfg.bg} ${cfg.border} border-2 rounded-xl shadow-md w-52 min-h-[60px] p-3`}>
        <p className={`${cfg.text} font-bold text-xs text-center leading-tight`}>{unit.nama}</p>
        {unit.kode && (
          <p className={`${cfg.sub} text-[10px] text-center mt-0.5`}>{unit.kode}</p>
        )}
        {unit.jabatan.length > 0 && (
          <div className="mt-2">
            {unit.jabatan.map((j) => (
              <JabatanRow
                key={j.id}
                nama={j.jabatan.nama}
                formasi={j.jumlahFormasi}
                ada={guruMap[j.jabatan.id] ?? 0}
                dark={isDark}
              />
            ))}
          </div>
        )}
      </div>

      {/* Connector */}
      {hasChildren && (
        <div className="flex flex-col items-center">
          {/* Garis turun dari node */}
          <div className="w-px h-6 bg-gray-300" />

          {unit.children.length === 1 ? (
            <div className="flex flex-col items-center">
              <div className="w-px h-6 bg-gray-300" />
              <UnitCard unit={unit.children[0]} level={level + 1} guruMap={guruMap} />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Garis horizontal */}
              <div
                className="h-px bg-gray-300"
                style={{ width: `${(unit.children.length - 1) * childGap}px` }}
              />
              <div className="flex" style={{ gap: `${childGap - 208}px` }}>
                {unit.children.map((child) => (
                  <div key={child.id} className="flex flex-col items-center">
                    <div className="w-px h-6 bg-gray-300" />
                    <UnitCard unit={child} level={level + 1} guruMap={guruMap} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BaganLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-5 p-3 bg-gray-50 rounded-lg">
      <span className="text-xs font-semibold text-gray-600">Keterangan:</span>
      {[
        { color: 'bg-blue-600', label: 'Level 1 (Pimpinan)' },
        { color: 'bg-emerald-500', label: 'Level 2 (Unit)' },
        { color: 'bg-white border border-gray-300', label: 'Level 3 (Sub Unit)' },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded ${item.color}`} />
          <span className="text-xs text-gray-600">{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
        {[
          { cls: 'bg-gray-200 text-gray-700', label: 'F = Formasi' },
          { cls: 'bg-green-100 text-green-700', label: 'A = Guru Ada' },
          { cls: 'bg-red-100 text-red-700', label: '-n = Kurang' },
          { cls: 'bg-yellow-100 text-yellow-700', label: '+n = Lebih' },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-1">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${b.cls}`}>{b.label.split(' ')[0]}</span>
            <span className="text-[10px] text-gray-500">{b.label.split(' = ')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Helper: flatten all jabatan from the tree ───────────────────────────────
function collectJabatan(
  nodes: UnitNode[],
  guruMap: Record<string, number>
): { jabatanId: string; nama: string; kode: string; formasi: number; ada: number; unitNama: string }[] {
  const result: { jabatanId: string; nama: string; kode: string; formasi: number; ada: number; unitNama: string }[] = []

  function walk(node: UnitNode) {
    for (const j of node.jabatan) {
      result.push({
        jabatanId: j.jabatan.id,
        nama: j.jabatan.nama,
        kode: j.jabatan.kode,
        formasi: j.jumlahFormasi,
        ada: guruMap[j.jabatan.id] ?? 0,
        unitNama: node.nama,
      })
    }
    for (const child of node.children) walk(child)
  }

  for (const node of nodes) walk(node)
  return result
}

// ─── Jabatan List Panel ───────────────────────────────────────────────────────
function JabatanListPanel({
  baganOrganisasi,
  guruMap,
}: {
  baganOrganisasi: UnitNode[]
  guruMap: Record<string, number>
}) {
  const jabatanList = collectJabatan(baganOrganisasi, guruMap)

  const totalFormasi = jabatanList.reduce((s, j) => s + j.formasi, 0)
  const totalAda = jabatanList.reduce((s, j) => s + j.ada, 0)
  const totalKurang = jabatanList.reduce((s, j) => s + Math.max(0, j.formasi - j.ada), 0)

  return (
    <Card className="w-72 flex-shrink-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Daftar Jabatan</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {jabatanList.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Briefcase size={28} className="text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Belum ada jabatan</p>
          </div>
        ) : (
          <>
            {/* Ringkasan */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50">
              {[
                { label: 'Formasi', value: totalFormasi, cls: 'text-gray-700' },
                { label: 'Terisi', value: totalAda, cls: 'text-green-600' },
                { label: 'Kurang', value: totalKurang, cls: totalKurang > 0 ? 'text-red-600' : 'text-gray-400' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center py-2">
                  <span className={`text-base font-bold ${s.cls}`}>{s.value}</span>
                  <span className="text-[10px] text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>

            {/* List */}
            <ul className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
              {jabatanList.map((j, idx) => {
                const kurang = Math.max(0, j.formasi - j.ada)
                const lebih = Math.max(0, j.ada - j.formasi)
                const statusOk = j.ada >= j.formasi

                return (
                  <li key={`${j.jabatanId}-${idx}`} className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{j.nama}</p>
                        <p className="text-[10px] text-gray-400 truncate">{j.unitNama}</p>
                      </div>
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${statusOk ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">
                        F:{j.formasi}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${statusOk ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        A:{j.ada}
                      </span>
                      {kurang > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-mono font-semibold">
                          -{kurang} kurang
                        </span>
                      )}
                      {lebih > 0 && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-mono">
                          +{lebih} lebih
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </CardBody>
    </Card>
  )
}

export function DashboardAdminSekolah({ sekolah, stats, baganOrganisasi, guruMap }: Props) {
  const adaDataBagan = baganOrganisasi.length > 0

  return (
    <div className="space-y-6">

      <RealtimeClock />

      {/* Info Sekolah */}
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{sekolah?.jenisSekolah}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{sekolah?.nama}</h2>
            <p className="text-sm text-gray-500">NPSN: {sekolah?.npsn} · Tahun Ajaran: {stats.tahunAjaran}</p>
          </div>
          <div className="ml-auto">
            <Badge color={stats.sudahHitung ? 'green' : 'yellow'}>
              {stats.sudahHitung ? '✓ Sudah Dihitung' : '⚠ Belum Dihitung'}
            </Badge>
          </div>
        </CardBody>
      </Card>

      {!stats.sudahHitung && (
        <Alert
          type="warning"
          message={`Data kebutuhan guru untuk tahun ajaran ${stats.tahunAjaran} belum dihitung. Pastikan data rombongan belajar sudah lengkap, lalu lakukan perhitungan.`}
        />
      )}

      {/* Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Guru" value={stats.totalGuru} icon={<GraduationCap size={22} />} color="blue" />
        <StatCard label="Rombongan Belajar" value={stats.totalRombel} icon={<BookOpen size={22} />} color="purple" />
        <StatCard label="Guru Dibutuhkan" value={stats.guruDibutuhkan} icon={<Users size={22} />} color="green" subtitle="Hasil perhitungan" />
        <StatCard
          label="Kekurangan"
          value={stats.kekurangan}
          icon={stats.kekurangan > 0 ? <AlertTriangle size={22} /> : <CheckCircle size={22} />}
          color={stats.kekurangan > 0 ? 'red' : 'green'}
          subtitle={stats.kelebihan > 0 ? `Kelebihan: ${stats.kelebihan}` : 'Terpenuhi'}
        />
      </div>

      {/* Bagan Organisasi + List Jabatan */}
      <div className="flex gap-4 items-start">
        {/* Bagan Organisasi */}
        <Card className="flex-1 min-w-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch size={16} className="text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Bagan Organisasi Sekolah</h3>
              </div>
              {adaDataBagan && (
                <Link href="/unit-organisasi" className="text-xs text-blue-600 hover:underline">
                  Kelola →
                </Link>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {adaDataBagan ? (
              <>
                <BaganLegend />
                <div className="overflow-x-auto">
                  <div className="inline-flex justify-center min-w-full px-6 py-4">
                    <div className="flex gap-12">
                      {baganOrganisasi.map((unit) => (
                        <UnitCard key={unit.id} unit={unit} level={0} guruMap={guruMap} />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GitBranch size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">Bagan organisasi belum tersedia</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Lengkapi data unit organisasi dan jabatan terlebih dahulu</p>
                <Link href="/unit-organisasi" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                  <GitBranch size={14} />
                  Kelola Unit Organisasi
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        {/* List Jabatan */}
        <JabatanListPanel baganOrganisasi={baganOrganisasi} guruMap={guruMap} />
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Menu Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/guru', label: 'Data Guru', icon: '👨‍🏫', desc: 'Kelola data guru' },
            { href: '/rombongan-belajar', label: 'Rombongan Belajar', icon: '📚', desc: 'Input data rombel' },
            { href: '/perhitungan', label: 'Hitung Kebutuhan', icon: '🧮', desc: 'Kalkulasi otomatis' },
            { href: '/laporan', label: 'Cetak Laporan', icon: '📄', desc: 'Laporan sekolah' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="text-center py-4">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}