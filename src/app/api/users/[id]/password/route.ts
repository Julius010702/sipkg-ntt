import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = (session.user as any).id

    // Hanya boleh ubah password diri sendiri
    if (userId !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: params.id },
      data: { password: newHash },
    })

    return NextResponse.json({ success: true, message: 'Password berhasil diubah' })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}