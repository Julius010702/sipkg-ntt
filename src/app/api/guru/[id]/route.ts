// src/app/api/guru/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { guruSchema } from '@/lib/validations'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guru = await prisma.guru.findUnique({
      where: { id: params.id },
      include: {
        jabatan: true,
        mataPelajaran: true,
        sekolah: { include: { kabupaten: true } },
      },
    })

    if (!guru) return NextResponse.json({ error: 'Guru tidak ditemukan' }, { status: 404 })

    // Admin Sekolah hanya bisa lihat guru sekolahnya
    const role = (session.user as any).role
    const sekolahIdSession = (session.user as any).sekolahId
    if (role === 'ADMIN_SEKOLAH' && guru.sekolahId !== sekolahIdSession) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ data: guru })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await prisma.guru.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'Guru tidak ditemukan' }, { status: 404 })

    const role = (session.user as any).role
    const sekolahIdSession = (session.user as any).sekolahId
    if (role === 'ADMIN_SEKOLAH' && existing.sekolahId !== sekolahIdSession) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = guruSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', issues: parsed.error.issues }, { status: 400 })
    }

    const guru = await prisma.guru.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        tanggalLahir: parsed.data.tanggalLahir ? new Date(parsed.data.tanggalLahir) : null,
        tmtPengangkatan: parsed.data.tmtPengangkatan ? new Date(parsed.data.tmtPengangkatan) : null,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id as string,
        aksi: 'UPDATE',
        modul: 'guru',
        dataId: guru.id,
        dataBefore: existing as any,
        dataAfter: guru as any,
      },
    })

    return NextResponse.json({ data: guru })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await prisma.guru.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'Guru tidak ditemukan' }, { status: 404 })

    const role = (session.user as any).role
    const sekolahIdSession = (session.user as any).sekolahId
    if (role === 'ADMIN_SEKOLAH' && existing.sekolahId !== sekolahIdSession) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete
    await prisma.guru.update({
      where: { id: params.id },
      data: { statusAktif: 'NONAKTIF' },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id as string,
        aksi: 'DELETE',
        modul: 'guru',
        dataId: params.id,
        dataBefore: existing as any,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
