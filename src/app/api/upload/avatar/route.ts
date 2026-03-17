import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const MAX_SIZE = 2 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = (session.user as any).id
    if (!userId) return NextResponse.json({ error: 'User ID tidak ditemukan' }, { status: 400 })

    const formData = await request.formData()
    const file = formData.get('avatar') as File | null

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 2MB.' },
        { status: 400 }
      )
    }

    // Pastikan folder ada
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Hapus foto lama jika ada
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    })

    if (existingUser?.avatar) {
      const oldPath = path.join(process.cwd(), 'public', existingUser.avatar.split('?')[0])
      if (existsSync(oldPath)) {
        await unlink(oldPath).catch(() => {})
      }
    }

    // Simpan file baru
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const fileName = `avatar_${userId}_${Date.now()}.${ext}`
    const filePath = path.join(uploadDir, fileName)
    const publicPath = `/uploads/avatars/${fileName}`

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Simpan path ke database
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: publicPath },
    })

    return NextResponse.json({
      success: true,
      avatar: publicPath,
      message: 'Foto profil berhasil diperbarui',
    })
  } catch (error) {
    console.error('[POST /api/upload/avatar]', error)
    return NextResponse.json({ error: 'Gagal mengupload foto' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = (session.user as any).id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    })

    if (user?.avatar) {
      const filePath = path.join(process.cwd(), 'public', user.avatar.split('?')[0])
      if (existsSync(filePath)) {
        await unlink(filePath).catch(() => {})
      }
      await prisma.user.update({
        where: { id: userId },
        data: { avatar: null },
      })
    }

    return NextResponse.json({ success: true, message: 'Foto profil berhasil dihapus' })
  } catch (error) {
    console.error('[DELETE /api/upload/avatar]', error)
    return NextResponse.json({ error: 'Gagal menghapus foto' }, { status: 500 })
  }
}