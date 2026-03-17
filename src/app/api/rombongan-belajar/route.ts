// src/app/api/rombongan-belajar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rombonganBelajarSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    const sekolahIdSession = (session.user as any).sekolahId
    const { searchParams } = new URL(request.url)
    const tahunAjaran = searchParams.get('tahunAjaran') ?? undefined
    const sekolahId = role === 'ADMIN_SEKOLAH' ? sekolahIdSession : searchParams.get('sekolahId') ?? undefined

    const data = await prisma.rombonganBelajar.findMany({
      where: {
        ...(sekolahId && { sekolahId }),
        ...(tahunAjaran && { tahunAjaran }),
      },
      include: {
        mapel: {
          include: { mataPelajaran: { select: { id: true, nama: true, kode: true } } },
        },
        sekolah: { select: { id: true, nama: true } },
      },
      orderBy: [{ tahunAjaran: 'desc' }, { tingkat: 'asc' }],
    })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    const sekolahIdSession = (session.user as any).sekolahId

    const body = await request.json()
    const parsed = rombonganBelajarSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', issues: parsed.error.issues }, { status: 400 })
    }

    const sekolahId = role === 'ADMIN_SEKOLAH' ? sekolahIdSession : body.sekolahId
    if (!sekolahId) return NextResponse.json({ error: 'sekolahId wajib diisi' }, { status: 400 })

    // Cek duplikat (sekolah + tahun + tingkat)
    const existing = await prisma.rombonganBelajar.findUnique({
      where: {
        sekolahId_tahunAjaran_tingkat: {
          sekolahId,
          tahunAjaran: parsed.data.tahunAjaran,
          tingkat: parsed.data.tingkat,
        },
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: `Data Kelas ${parsed.data.tingkat} untuk ${parsed.data.tahunAjaran} sudah ada` },
        { status: 409 }
      )
    }

    const rombel = await prisma.rombonganBelajar.create({
      data: { ...parsed.data, sekolahId },
    })

    return NextResponse.json({ data: rombel }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
