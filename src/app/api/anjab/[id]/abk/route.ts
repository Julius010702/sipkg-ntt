// src/app/api/anjab/[id]/abk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await prisma.abk.findMany({
      where: { anjabId: params.id },
      orderBy: { namaJabatan: 'asc' },
    })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'ADMIN_PUSAT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const {
      namaJabatan,
      tahun,
      volumeBebanKerja,
      normaWaktu,
      pegawaiAda,
    } = body

    // Hitung waktu penyelesaian dan pegawai dibutuhkan
    // Waktu efektif kerja = 1250 jam/tahun = 75.000 menit/tahun
    const WAKTU_EFEKTIF_MENIT = 75000
    const waktePenyelesaian = (volumeBebanKerja ?? 0) * (normaWaktu ?? 0)
    const pegawaiDibutuhkan = waktePenyelesaian / WAKTU_EFEKTIF_MENIT
    const kekurangan = Math.max(0, Math.ceil(pegawaiDibutuhkan) - (pegawaiAda ?? 0))
    const kelebihan = Math.max(0, (pegawaiAda ?? 0) - Math.ceil(pegawaiDibutuhkan))

    const data = await prisma.abk.create({
      data: {
        anjabId: params.id,
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
    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
