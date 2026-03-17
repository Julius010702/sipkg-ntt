// src/app/api/dashboard/guru-stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sekolahId = searchParams.get('sekolahId')

    const whereGuru = {
      statusAktif: 'AKTIF' as const,
      ...(sekolahId ? { sekolahId } : {}),
    }

    // Hitung total guru
    const totalGuru = await prisma.guru.count({ where: whereGuru })

    // Hitung PNS
    const totalPNS = await prisma.guru.count({
      where: { ...whereGuru, statusGuru: 'PNS' },
    })

    // Hitung PPPK (masuk NonPNS)
    const totalPPPK = await prisma.guru.count({
      where: { ...whereGuru, statusGuru: 'PPPK' },
    })

    // NonPNS = HONORER + GTT + PPPK
    const totalNonPNS = totalGuru - totalPNS

    // Ambil kebutuhan guru
    let totalDibutuhkan = 0
    let totalAda        = 0
    let totalKekurangan = 0
    let totalKelebihan  = 0

    if (sekolahId) {
      // Ambil kebutuhan untuk sekolah ini (tahun ajaran aktif)
      const kebutuhan = await prisma.kebutuhanGuru.findFirst({
        where: { sekolahId, statusHitung: true },
        orderBy: { tanggalHitung: 'desc' },
      })
      if (kebutuhan) {
        totalDibutuhkan = kebutuhan.totalGuruDibutuhkan
        totalAda        = kebutuhan.totalGuruAda
        totalKekurangan = kebutuhan.totalKekurangan
        totalKelebihan  = kebutuhan.totalKelebihan
      } else {
        totalAda = totalGuru
      }
    } else {
      // Agregat semua sekolah
      const agg = await prisma.kebutuhanGuru.aggregate({
        where: { statusHitung: true },
        _sum: {
          totalGuruDibutuhkan: true,
          totalGuruAda: true,
          totalKekurangan: true,
          totalKelebihan: true,
        },
      })
      totalDibutuhkan = agg._sum.totalGuruDibutuhkan ?? 0
      totalAda        = agg._sum.totalGuruAda        ?? totalGuru
      totalKekurangan = agg._sum.totalKekurangan     ?? 0
      totalKelebihan  = agg._sum.totalKelebihan      ?? 0
    }

    return NextResponse.json({
      data: {
        totalGuru,
        totalPNS,
        totalNonPNS,
        totalDibutuhkan,
        totalAda,
        totalKekurangan,
        totalKelebihan,
      },
    })
  } catch (error) {
    console.error('guru-stats error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}