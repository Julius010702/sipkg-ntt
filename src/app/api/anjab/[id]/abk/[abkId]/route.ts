// src/app/api/anjab/[id]/abk/[abkId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const WAKTU_EFEKTIF = 75000

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; abkId: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'ADMIN_PUSAT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { namaJabatan, tahun, volumeBebanKerja, normaWaktu, pegawaiAda } = body

    const waktePenyelesaian = (volumeBebanKerja ?? 0) * (normaWaktu ?? 0)
    const pegawaiDibutuhkan = waktePenyelesaian / WAKTU_EFEKTIF
    const kekurangan = Math.max(0, Math.ceil(pegawaiDibutuhkan) - (pegawaiAda ?? 0))
    const kelebihan = Math.max(0, (pegawaiAda ?? 0) - Math.ceil(pegawaiDibutuhkan))

    const data = await prisma.abk.update({
      where: { id: params.abkId },
      data: {
        namaJabatan,
        tahun: parseInt(tahun),
        volumeBebanKerja: parseInt(volumeBebanKerja ?? 0),
        normaWaktu: parseInt(normaWaktu ?? 0),
        waktePenyelesaian,
        pegawaiDibutuhkan,
        pegawaiAda: parseInt(pegawaiAda ?? 0),
        kekurangan,
        kelebihan,
      },
    })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; abkId: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'ADMIN_PUSAT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.abk.delete({ where: { id: params.abkId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
