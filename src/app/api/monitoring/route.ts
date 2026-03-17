// src/app/api/monitoring/route.ts
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
    const kabupatenId = searchParams.get('kabupatenId') ?? undefined
    const jenisSekolah = searchParams.get('jenisSekolah') ?? undefined

    if (!tahunAjaran) return NextResponse.json({ error: 'tahunAjaran wajib diisi' }, { status: 400 })

    // Data kebutuhan guru per sekolah
    const data = await prisma.kebutuhanGuru.findMany({
      where: {
        tahunAjaran,
        sekolah: {
          statusAktif: 'AKTIF',
          ...(kabupatenId && { kabupatenId }),
          ...(jenisSekolah && { jenisSekolah }),
        },
      },
      include: {
        sekolah: {
          include: { kabupaten: { select: { id: true, nama: true } } },
        },
        detail: {
          include: { mataPelajaran: { select: { id: true, nama: true } } },
        },
      },
      orderBy: { sekolah: { nama: 'asc' } },
    })

    // Sekolah yang belum menghitung
    const belumHitung = await prisma.sekolah.findMany({
      where: {
        statusAktif: 'AKTIF',
        ...(kabupatenId && { kabupatenId }),
        ...(jenisSekolah && { jenisSekolah }),
        kebutuhanGuru: { none: { tahunAjaran } },
      },
      include: { kabupaten: { select: { id: true, nama: true } } },
      orderBy: { nama: 'asc' },
    })

    // Rekap per kabupaten
    const rekapKabupaten = await prisma.kebutuhanGuru.groupBy({
      by: ['sekolahId'],
      where: { tahunAjaran },
      _sum: {
        totalGuruDibutuhkan: true,
        totalGuruAda: true,
        totalKekurangan: true,
        totalKelebihan: true,
      },
    })

    // Statistik ringkas
    const stats = {
      totalSekolahDenganData: data.length,
      totalSekolahBelumHitung: belumHitung.length,
      totalGuruDibutuhkan: data.reduce((s, d) => s + d.totalGuruDibutuhkan, 0),
      totalGuruAda: data.reduce((s, d) => s + d.totalGuruAda, 0),
      totalKekurangan: data.reduce((s, d) => s + d.totalKekurangan, 0),
      totalKelebihan: data.reduce((s, d) => s + d.totalKelebihan, 0),
    }

    return NextResponse.json({
      data,
      belumHitung,
      stats,
    })
  } catch (error) {
    console.error('[GET /api/monitoring]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
