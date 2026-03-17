import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardAdminPusat } from '@/components/dashboard/DashboardAdminPusat'
import { DashboardAdminSekolah } from '@/components/dashboard/DashboardAdminSekolah'

function getTahunAjaranOtomatis(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const role = (session.user as any).role
  const sekolahId = (session.user as any).sekolahId

  const tahunAktif = await prisma.pengaturanSistem.findUnique({
    where: { kunci: 'TAHUN_AKTIF' },
  })
  const tahunAjaran = tahunAktif?.nilai ?? getTahunAjaranOtomatis()

  // ── ADMIN PUSAT ─────────────────────────────────────────────────────────────
  if (role === 'ADMIN_PUSAT') {
    const [
      totalSekolah, totalSMA, totalSMK, totalSLB,
      totalGuruAktif, totalPNS,
      rekapKebutuhan, sekolahBelumHitung, sekolahList,
    ] = await Promise.all([
      prisma.sekolah.count({ where: { statusAktif: 'AKTIF' } }),
      prisma.sekolah.count({ where: { jenisSekolah: 'SMA', statusAktif: 'AKTIF' } }),
      prisma.sekolah.count({ where: { jenisSekolah: 'SMK', statusAktif: 'AKTIF' } }),
      prisma.sekolah.count({ where: { jenisSekolah: 'SLB', statusAktif: 'AKTIF' } }),

      // ← baru: hitung total guru & PNS
      prisma.guru.count({ where: { statusAktif: 'AKTIF' } }),
      prisma.guru.count({ where: { statusAktif: 'AKTIF', statusGuru: 'PNS' } }),

      prisma.kebutuhanGuru.aggregate({
        where: { tahunAjaran },
        _sum: {
          totalGuruDibutuhkan: true,
          totalGuruAda: true,
          totalKekurangan: true,
          totalKelebihan: true,
        },
      }),
      prisma.sekolah.count({
        where: {
          statusAktif: 'AKTIF',
          kebutuhanGuru: { none: { tahunAjaran } },
        },
      }),

      // ← baru: daftar sekolah untuk dropdown OPD
      prisma.sekolah.findMany({
        where: { statusAktif: 'AKTIF' },
        select: { id: true, nama: true, npsn: true },
        orderBy: { nama: 'asc' },
      }),
    ])

    const totalNonPNS = totalGuruAktif - totalPNS

    return (
      <DashboardAdminPusat
        stats={{
          totalSekolah, totalSMA, totalSMK, totalSLB,
          totalGuruDibutuhkan: rekapKebutuhan._sum.totalGuruDibutuhkan ?? 0,
          totalGuruAda:        rekapKebutuhan._sum.totalGuruAda        ?? 0,
          totalKekurangan:     rekapKebutuhan._sum.totalKekurangan     ?? 0,
          totalKelebihan:      rekapKebutuhan._sum.totalKelebihan      ?? 0,
          sekolahBelumHitung,
          tahunAjaran,
          totalPNS,      // ← baru
          totalNonPNS,   // ← baru
        }}
        sekolahList={sekolahList}  // ← baru
      />
    )
  }

  // ── ADMIN SEKOLAH ───────────────────────────────────────────────────────────
  if (role === 'ADMIN_SEKOLAH' && sekolahId) {
    const [sekolah, totalGuru, totalRombel, kebutuhan, unitOrganisasi] = await Promise.all([
      prisma.sekolah.findUnique({ where: { id: sekolahId } }),
      prisma.guru.count({ where: { sekolahId, statusAktif: 'AKTIF' } }),
      prisma.rombonganBelajar.aggregate({
        where: { sekolahId, tahunAjaran },
        _sum: { jumlahRombel: true },
      }),
      prisma.kebutuhanGuru.findUnique({
        where: { sekolahId_tahunAjaran: { sekolahId, tahunAjaran } },
      }),
      prisma.unitOrganisasi.findMany({
        where: { sekolahId, statusAktif: 'AKTIF' },
        include: {
          jabatan: { include: { jabatan: true } },
          children: {
            where: { statusAktif: 'AKTIF' },
            include: {
              jabatan: { include: { jabatan: true } },
              children: {
                where: { statusAktif: 'AKTIF' },
                include: {
                  jabatan: { include: { jabatan: true } },
                },
              },
            },
          },
        },
      }),
    ])

    const baganOrganisasi = unitOrganisasi.filter(u => u.parentId === null)

    const guruPerJabatan = await prisma.guru.groupBy({
      by: ['jabatanId'],
      where: { sekolahId, statusAktif: 'AKTIF', jabatanId: { not: null } },
      _count: { id: true },
    })

    const guruMap = Object.fromEntries(
      guruPerJabatan.map(g => [g.jabatanId!, g._count.id])
    )

    return (
      <DashboardAdminSekolah
        sekolah={sekolah}
        stats={{
          totalGuru,
          totalRombel: totalRombel._sum.jumlahRombel ?? 0,
          guruDibutuhkan: kebutuhan?.totalGuruDibutuhkan ?? 0,
          kekurangan:     kebutuhan?.totalKekurangan     ?? 0,
          kelebihan:      kebutuhan?.totalKelebihan      ?? 0,
          sudahHitung:    kebutuhan?.statusHitung        ?? false,
          tahunAjaran,
        }}
        baganOrganisasi={baganOrganisasi as any}
        guruMap={guruMap}
      />
    )
  }

  redirect('/login')
}