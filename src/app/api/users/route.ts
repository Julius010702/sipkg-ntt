// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'ADMIN_PUSAT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const filterRole = searchParams.get('role') ?? undefined

    const users = await prisma.user.findMany({
      where: {
        ...(filterRole && { role: filterRole as any }),
        ...(search && {
          OR: [
            { nama: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        sekolah: { select: { id: true, nama: true, jenisSekolah: true } },
      },
      orderBy: { nama: 'asc' },
    })

    // Jangan kirim password hash ke client
    const safeUsers = users.map(({ password, ...u }) => u)
    return NextResponse.json({ data: safeUsers })
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
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', issues: parsed.error.issues }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (existing) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })

    const passwordHash = await bcrypt.hash(parsed.data.password, 10)

    const user = await prisma.user.create({
      data: {
        nama: parsed.data.nama,
        email: parsed.data.email,
        password: passwordHash,
        role: parsed.data.role,
        sekolahId: parsed.data.sekolahId ?? null,
      },
    })

    const { password, ...safeUser } = user
    return NextResponse.json({ data: safeUser }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
