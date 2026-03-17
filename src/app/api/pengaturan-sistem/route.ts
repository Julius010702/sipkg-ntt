// src/app/api/pengaturan-sistem/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const kunci = searchParams.get('kunci')

    if (kunci) {
      const data = await prisma.pengaturanSistem.findUnique({ where: { kunci } })
      return NextResponse.json({ data })
    }

    const data = await prisma.pengaturanSistem.findMany({ orderBy: { kunci: 'asc' } })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'ADMIN_PUSAT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { updates } = body as { updates: { kunci: string; nilai: string }[] }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Format tidak valid' }, { status: 400 })
    }

    const results = await Promise.all(
      updates.map(u =>
        prisma.pengaturanSistem.upsert({
          where: { kunci: u.kunci },
          update: { nilai: u.nilai },
          create: { kunci: u.kunci, nilai: u.nilai },
        })
      )
    )

    return NextResponse.json({ data: results })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
