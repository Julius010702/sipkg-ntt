// src/app/api/mata-pelajaran/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mataPelajaranSchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await prisma.mataPelajaran.findMany({
      where: { statusAktif: 'AKTIF' },
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

    const body = await request.json()
    const parsed = mataPelajaranSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', issues: parsed.error.issues }, { status: 400 })
    }

    const existing = await prisma.mataPelajaran.findUnique({ where: { kode: parsed.data.kode } })
    if (existing) return NextResponse.json({ error: 'Kode sudah digunakan' }, { status: 409 })

    const data = await prisma.mataPelajaran.create({ data: parsed.data })
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
