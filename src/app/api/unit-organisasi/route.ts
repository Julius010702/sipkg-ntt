// src/app/api/unit-organisasi/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unitOrganisasiSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    const sekolahIdSession = (session.user as any).sekolahId
    const { searchParams } = new URL(request.url)
    const sekolahId = role === 'ADMIN_SEKOLAH' ? sekolahIdSession : searchParams.get('sekolahId') ?? undefined

    const data = await prisma.unitOrganisasi.findMany({
      where: {
        statusAktif: 'AKTIF',
        ...(sekolahId && { sekolahId }),
      },
      include: { jabatan: { include: { jabatan: true } } },
      orderBy: { nama: 'asc' },
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
    const parsed = unitOrganisasiSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', issues: parsed.error.issues }, { status: 400 })
    }

    const sekolahId = role === 'ADMIN_SEKOLAH' ? sekolahIdSession : body.sekolahId
    if (!sekolahId) return NextResponse.json({ error: 'sekolahId wajib diisi' }, { status: 400 })

    const data = await prisma.unitOrganisasi.create({
      data: { ...parsed.data, sekolahId },
    })
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
