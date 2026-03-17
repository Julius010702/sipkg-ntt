// src/app/api/laporan/sekolah/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    const sekolahIdSession = (session.user as any).sekolahId

    const { searchParams } = new URL(request.url)
    const tahunAjaran = searchParams.get('tahunAjaran')
    const sekolahId = role === 'ADMIN_SEKOLAH' ? sekolahIdSession : searchParams.get('sekolahId')

    if (!tahunAjaran || !sekolahId) {
      return NextResponse.json({ error: 'tahunAjaran dan sekolahId wajib diisi' }, { status: 400 })
    }

    const [sekolah, kebutuhan, guruList, rombel] = await Promise.all([
      prisma.sekolah.findUnique({
        where: { id: sekolahId },
        include: { kabupaten: true },
      }),
      prisma.kebutuhanGuru.findUnique({
        where: { sekolahId_tahunAjaran: { sekolahId, tahunAjaran } },
        include: {
          detail: {
            include: { mataPelajaran: true },
            orderBy: { mataPelajaran: { nama: 'asc' } },
          },
        },
      }),
      prisma.guru.findMany({
        where: { sekolahId, statusAktif: 'AKTIF' },
        include: {
          jabatan: true,
          mataPelajaran: true,
        },
        orderBy: { nama: 'asc' },
      }),
      prisma.rombonganBelajar.findMany({
        where: { sekolahId, tahunAjaran },
        orderBy: { tingkat: 'asc' },
      }),
    ])

    if (!sekolah) return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 })

    return NextResponse.json({
      sekolah,
      tahunAjaran,
      kebutuhan,
      guruList,
      rombel,
      tanggalCetak: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
