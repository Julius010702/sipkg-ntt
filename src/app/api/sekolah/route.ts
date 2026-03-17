// src/app/api/sekolah/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sekolahSchema } from '@/lib/validations'
import { buildPaginationMeta } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const perPage = parseInt(searchParams.get('perPage') ?? '20')
    const search = searchParams.get('search') ?? ''
    const jenis = searchParams.get('jenis') ?? undefined
    const kabupatenId = searchParams.get('kabupatenId') ?? undefined

    const where: any = {
      statusAktif: 'AKTIF',
      ...(jenis && { jenisSekolah: jenis }),
      ...(kabupatenId && { kabupatenId }),
      ...(search && {
        OR: [
          { nama: { contains: search, mode: 'insensitive' } },
          { npsn: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      prisma.sekolah.findMany({
        where,
        include: {
          kabupaten: { select: { id: true, nama: true } },
          _count: { select: { guru: true } },
        },
        orderBy: [{ jenisSekolah: 'asc' }, { nama: 'asc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.sekolah.count({ where }),
    ])

    return NextResponse.json({ data, meta: buildPaginationMeta(total, page, perPage) })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'ADMIN_PUSAT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const parsed = sekolahSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', issues: parsed.error.issues }, { status: 400 })
    }

    const existing = await prisma.sekolah.findUnique({ where: { npsn: parsed.data.npsn } })
    if (existing) return NextResponse.json({ error: 'NPSN sudah terdaftar' }, { status: 409 })

    const sekolah = await prisma.sekolah.create({ data: parsed.data })

    return NextResponse.json({ data: sekolah }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
