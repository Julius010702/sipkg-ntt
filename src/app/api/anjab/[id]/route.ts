// src/app/api/anjab/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anjabSchema } from '@/lib/validations'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await prisma.anjab.findUnique({
      where: { id: params.id },
      include: {
        detail: { include: { jabatan: true } },
        abk: { orderBy: { namaJabatan: 'asc' } },
      },
    })
    if (!data) return NextResponse.json({ error: 'ANJAB tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'ADMIN_PUSAT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const parsed = anjabSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', issues: parsed.error.issues }, { status: 400 })
    }

    const data = await prisma.anjab.update({ where: { id: params.id }, data: parsed.data })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'ADMIN_PUSAT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Hapus relasi ABK dan detail terlebih dahulu
    await prisma.abk.deleteMany({ where: { anjabId: params.id } })
    await prisma.anjabDetail.deleteMany({ where: { anjabId: params.id } })
    await prisma.anjab.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
