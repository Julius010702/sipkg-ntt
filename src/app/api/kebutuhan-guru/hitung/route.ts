// src/app/api/kebutuhan-guru/hitung/route.ts
// Endpoint POST untuk trigger kalkulasi kebutuhan guru

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { hitungKebutuhanGuru, simpanHasilPerhitungan } from '@/lib/calculations/kebutuhanGuru'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (session.user as any).role
    const sekolahIdSession = (session.user as any).sekolahId

    const body = await request.json()
    const { sekolahId, tahunAjaran } = body

    if (!sekolahId || !tahunAjaran) {
      return NextResponse.json(
        { error: 'sekolahId dan tahunAjaran wajib diisi' },
        { status: 400 }
      )
    }

    // Admin Sekolah hanya bisa hitung sekolahnya sendiri
    if (role === 'ADMIN_SEKOLAH' && sekolahId !== sekolahIdSession) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const hasil = await hitungKebutuhanGuru(sekolahId, tahunAjaran)
    const saved = await simpanHasilPerhitungan(sekolahId, tahunAjaran, hasil)

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id as string,
        aksi: 'HITUNG',
        modul: 'kebutuhan_guru',
        dataId: saved.id,
        dataAfter: { sekolahId, tahunAjaran, totalDetail: hasil.length },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Perhitungan kebutuhan guru berhasil',
      data: {
        id: saved.id,
        totalGuruDibutuhkan: saved.totalGuruDibutuhkan,
        totalGuruAda: saved.totalGuruAda,
        totalKekurangan: saved.totalKekurangan,
        totalKelebihan: saved.totalKelebihan,
        detail: hasil,
      },
    })
  } catch (error: any) {
    console.error('[POST /api/kebutuhan-guru/hitung]', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
