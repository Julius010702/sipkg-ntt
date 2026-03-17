// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateUserSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'ADMIN_PUSAT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', issues: parsed.error.issues }, { status: 400 })
    }

    const updateData: any = {
      nama: parsed.data.nama,
      email: parsed.data.email,
      role: parsed.data.role,
      sekolahId: parsed.data.sekolahId ?? null,
    }

    if (parsed.data.password && parsed.data.password.length >= 6) {
      updateData.password = await bcrypt.hash(parsed.data.password, 10)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    })

    const { password, ...safeUser } = user
    return NextResponse.json({ data: safeUser })
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

    // Jangan hapus diri sendiri
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Tidak dapat menonaktifkan akun sendiri' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { statusAktif: 'NONAKTIF' },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
