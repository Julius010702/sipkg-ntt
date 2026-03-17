// src/app/api/kebutuhan-guru/route.ts
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
    const tahunAjaran = searchParams.get('tahunAjaran') ?? undefined
    const sekolahId = role === 'ADMIN_SEKOLAH'
      ? sekolahIdSession
      : searchParams.get('sekolahId') ?? undefined

    if (!sekolahId || !tahunAjaran) {
      return NextResponse.json({ error: 'sekolahId dan tahunAjaran wajib diisi' }, { status: 400 })
    }

    const data = await prisma.kebutuhanGuru.findUnique({
      where: { sekolahId_tahunAjaran: { sekolahId, tahunAjaran } },
      include: {
        detail: {
          include: { mataPelajaran: { select: { id: true, nama: true, kode: true } } },
          orderBy: { mataPelajaran: { nama: 'asc' } },
        },
        sekolah: { select: { id: true, nama: true, jenisSekolah: true } },
      },
    })

    return NextResponse.json({ data: data ?? null })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
