// src/app/api/guru/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { guruSchema } from '@/lib/validations'
import { buildPaginationMeta } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    const sekolahIdSession = (session.user as any).sekolahId

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const perPage = parseInt(searchParams.get('perPage') ?? '20')
    const search = searchParams.get('search') ?? ''
    const statusGuru = searchParams.get('statusGuru') ?? undefined
    const sekolahId = role === 'ADMIN_SEKOLAH' ? sekolahIdSession : searchParams.get('sekolahId') ?? undefined

    const where: any = {
      statusAktif: 'AKTIF',
      ...(sekolahId && { sekolahId }),
      ...(statusGuru && { statusGuru }),
      ...(search && {
        OR: [
          { nama: { contains: search, mode: 'insensitive' } },
          { nip: { contains: search, mode: 'insensitive' } },
          { nuptk: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      prisma.guru.findMany({
        where,
        include: {
          jabatan: { select: { id: true, nama: true } },
          mataPelajaran: { select: { id: true, nama: true } },
          sekolah: { select: { id: true, nama: true } },
        },
        orderBy: { nama: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.guru.count({ where }),
    ])

    return NextResponse.json({ data, meta: buildPaginationMeta(total, page, perPage) })
  } catch (error) {
    console.error('[GET /api/guru]', error)
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
    const parsed = guruSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', issues: parsed.error.issues }, { status: 400 })
    }

    const sekolahId = role === 'ADMIN_SEKOLAH' ? sekolahIdSession : body.sekolahId
    if (!sekolahId) return NextResponse.json({ error: 'sekolahId wajib diisi' }, { status: 400 })

    // Cek duplikat NIP
    if (parsed.data.nip) {
      const existing = await prisma.guru.findUnique({ where: { nip: parsed.data.nip } })
      if (existing) return NextResponse.json({ error: 'NIP sudah terdaftar' }, { status: 409 })
    }

    const guru = await prisma.guru.create({
      data: {
        ...parsed.data,
        sekolahId,
        tanggalLahir: parsed.data.tanggalLahir ? new Date(parsed.data.tanggalLahir) : null,
        tmtPengangkatan: parsed.data.tmtPengangkatan ? new Date(parsed.data.tmtPengangkatan) : null,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id as string,
        aksi: 'CREATE',
        modul: 'guru',
        dataId: guru.id,
        dataAfter: guru as any,
      },
    })

    return NextResponse.json({ data: guru }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/guru]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
