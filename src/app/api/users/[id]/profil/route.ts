import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        avatar: true,
        statusAktif: true,
        sekolah: {
          select: { id: true, nama: true },
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    return NextResponse.json({ data: user })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = (session.user as any).id
    if (userId !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { nama } = await request.json()
    if (!nama || nama.trim().length < 3) {
      return NextResponse.json({ error: 'Nama minimal 3 karakter' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { nama: nama.trim() },
    })

    const { password, ...safeUser } = user
    return NextResponse.json({ data: safeUser })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}