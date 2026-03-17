// src/app/api/laporan/provinsi/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'ADMIN_PUSAT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const tahunAjaran = searchParams.get('tahunAjaran')
    const jenisSekolah = searchParams.get('jenisSekolah') ?? undefined

    if (!tahunAjaran) return NextResponse.json({ error: 'tahunAjaran wajib diisi' }, { status: 400 })

    // Rekap per kabupaten
    const kabupatenList = await prisma.kabupaten.findMany({
      orderBy: { nama: 'asc' },
    })

    const rekapData = await Promise.all(
      kabupatenList.map(async (kab) => {
        const kebutuhanList = await prisma.kebutuhanGuru.findMany({
          where: {
            tahunAjaran,
            sekolah: {
              kabupatenId: kab.id,
              statusAktif: 'AKTIF',
              ...(jenisSekolah && { jenisSekolah }),
            },
          },
          include: {
            sekolah: { select: { id: true, nama: true, jenisSekolah: true } },
          },
        })

        const totalSekolah = await prisma.sekolah.count({
          where: {
            kabupatenId: kab.id,
            statusAktif: 'AKTIF',
            ...(jenisSekolah && { jenisSekolah }),
          },
        })

        return {
          kabupaten: kab,
          totalSekolah,
          sekolahSudahHitung: kebutuhanList.length,
          totalGuruDibutuhkan: kebutuhanList.reduce((s, k) => s + k.totalGuruDibutuhkan, 0),
          totalGuruAda: kebutuhanList.reduce((s, k) => s + k.totalGuruAda, 0),
          totalKekurangan: kebutuhanList.reduce((s, k) => s + k.totalKekurangan, 0),
          totalKelebihan: kebutuhanList.reduce((s, k) => s + k.totalKelebihan, 0),
          sekolahList: kebutuhanList,
        }
      })
    )

    // Rekap per mata pelajaran (provinsi)
    const rekapMapel = await prisma.kebutuhanGuruDetail.groupBy({
      by: ['mataPelajaranId'],
      where: {
        kebutuhanGuru: {
          tahunAjaran,
          sekolah: {
            statusAktif: 'AKTIF',
            ...(jenisSekolah && { jenisSekolah }),
          },
        },
      },
      _sum: {
        jumlahGuruDibutuhkan: true,
        jumlahGuruAda: true,
        kekurangan: true,
        kelebihan: true,
      },
    })

    const mataPelajaranIds = rekapMapel.map((r) => r.mataPelajaranId)
    const mataPelajaranList = await prisma.mataPelajaran.findMany({
      where: { id: { in: mataPelajaranIds } },
    })
    const mapelMap = Object.fromEntries(mataPelajaranList.map((m) => [m.id, m]))

    const rekapMapelWithNama = rekapMapel.map((r) => ({
      mataPelajaran: mapelMap[r.mataPelajaranId],
      ...r._sum,
    }))

    return NextResponse.json({
      tahunAjaran,
      jenisSekolah: jenisSekolah ?? 'SEMUA',
      rekapKabupaten: rekapData,
      rekapMapel: rekapMapelWithNama,
      tanggalCetak: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/laporan/provinsi]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
