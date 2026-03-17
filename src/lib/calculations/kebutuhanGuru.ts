// src/lib/calculations/kebutuhanGuru.ts
// Algoritma Perhitungan Kebutuhan Guru sesuai standar Kemendikbud

import { prisma } from '@/lib/prisma'

const JAM_MENGAJAR_WAJIB = 24 // jam tatap muka per minggu

export interface HasilPerhitungan {
  mataPelajaranId: string
  namaMapel: string
  jumlahRombel: number
  jamPerMinggu: number
  totalJamDibutuhkan: number
  jumlahGuruDibutuhkan: number
  jumlahGuruAda: number
  kekurangan: number
  kelebihan: number
}

/**
 * Hitung kebutuhan guru satu sekolah untuk satu tahun ajaran
 *
 * Rumus:
 * - Total Jam Dibutuhkan = Jumlah Rombel × Jam Mapel per Minggu (semua tingkat)
 * - Guru Dibutuhkan = CEILING(Total Jam / Jam Wajib Mengajar)
 * - Kekurangan = MAX(0, Guru Dibutuhkan - Guru Ada)
 * - Kelebihan  = MAX(0, Guru Ada - Guru Dibutuhkan)
 */
export async function hitungKebutuhanGuru(
  sekolahId: string,
  tahunAjaran: string
): Promise<HasilPerhitungan[]> {
  
  // Ambil semua rombel sekolah pada tahun ajaran ini
  const rombonganBelajar = await prisma.rombonganBelajar.findMany({
    where: { sekolahId, tahunAjaran },
    include: {
      mapel: {
        include: { mataPelajaran: true },
      },
    },
  })

  if (rombonganBelajar.length === 0) {
    throw new Error('Data rombongan belajar belum diinput untuk tahun ajaran ini')
  }

  // Ambil semua guru di sekolah ini
  const guruList = await prisma.guru.findMany({
    where: { sekolahId, statusAktif: 'AKTIF' },
    include: { mataPelajaran: true },
  })

  // Hitung total jam per mata pelajaran (akumulasi semua tingkat)
  const mapJamPerMapel = new Map<
    string,
    { nama: string; totalRombel: number; totalJam: number }
  >()

  for (const rb of rombonganBelajar) {
    for (const rbMapel of rb.mapel) {
      const key = rbMapel.mataPelajaranId
      const existing = mapJamPerMapel.get(key)

      if (existing) {
        existing.totalRombel += rb.jumlahRombel
        existing.totalJam += rb.jumlahRombel * rbMapel.jamPerMinggu
      } else {
        mapJamPerMapel.set(key, {
          nama: rbMapel.mataPelajaran.nama,
          totalRombel: rb.jumlahRombel,
          totalJam: rb.jumlahRombel * rbMapel.jamPerMinggu,
        })
      }
    }
  }

  // Hitung jumlah guru yang tersedia per mata pelajaran
  const mapGuruAda = new Map<string, number>()
  for (const guru of guruList) {
    if (guru.mataPelajaranId) {
      const ada = mapGuruAda.get(guru.mataPelajaranId) || 0
      mapGuruAda.set(guru.mataPelajaranId, ada + 1)
    }
  }

  // Buat hasil perhitungan
  const hasil: HasilPerhitungan[] = []

  for (const [mapelId, data] of mapJamPerMapel) {
    const guruDibutuhkan = Math.ceil(data.totalJam / JAM_MENGAJAR_WAJIB)
    const guruAda = mapGuruAda.get(mapelId) || 0
    const kekurangan = Math.max(0, guruDibutuhkan - guruAda)
    const kelebihan = Math.max(0, guruAda - guruDibutuhkan)

    hasil.push({
      mataPelajaranId: mapelId,
      namaMapel: data.nama,
      jumlahRombel: data.totalRombel,
      jamPerMinggu: data.totalJam / data.totalRombel,
      totalJamDibutuhkan: data.totalJam,
      jumlahGuruDibutuhkan: guruDibutuhkan,
      jumlahGuruAda: guruAda,
      kekurangan,
      kelebihan,
    })
  }

  return hasil
}

/**
 * Simpan hasil perhitungan ke database
 */
export async function simpanHasilPerhitungan(
  sekolahId: string,
  tahunAjaran: string,
  hasil: HasilPerhitungan[]
) {
  const totalDibutuhkan = hasil.reduce((sum, h) => sum + h.jumlahGuruDibutuhkan, 0)
  const totalAda = hasil.reduce((sum, h) => sum + h.jumlahGuruAda, 0)
  const totalKekurangan = hasil.reduce((sum, h) => sum + h.kekurangan, 0)
  const totalKelebihan = hasil.reduce((sum, h) => sum + h.kelebihan, 0)

  // Upsert header kebutuhan guru
  const kebutuhanGuru = await prisma.kebutuhanGuru.upsert({
    where: { sekolahId_tahunAjaran: { sekolahId, tahunAjaran } },
    update: {
      totalGuruAda: totalAda,
      totalGuruDibutuhkan: totalDibutuhkan,
      totalKekurangan: totalKekurangan,
      totalKelebihan: totalKelebihan,
      statusHitung: true,
      tanggalHitung: new Date(),
    },
    create: {
      sekolahId,
      tahunAjaran,
      totalGuruAda: totalAda,
      totalGuruDibutuhkan: totalDibutuhkan,
      totalKekurangan: totalKekurangan,
      totalKelebihan: totalKelebihan,
      statusHitung: true,
      tanggalHitung: new Date(),
    },
  })

  // Hapus detail lama, simpan yang baru
  await prisma.kebutuhanGuruDetail.deleteMany({
    where: { kebutuhanGuruId: kebutuhanGuru.id },
  })

  await prisma.kebutuhanGuruDetail.createMany({
    data: hasil.map((h) => ({
      kebutuhanGuruId: kebutuhanGuru.id,
      mataPelajaranId: h.mataPelajaranId,
      jumlahRombel: h.jumlahRombel,
      jamPerMinggu: h.jamPerMinggu,
      totalJamDibutuhkan: h.totalJamDibutuhkan,
      jumlahGuruDibutuhkan: h.jumlahGuruDibutuhkan,
      jumlahGuruAda: h.jumlahGuruAda,
      kekurangan: h.kekurangan,
      kelebihan: h.kelebihan,
    })),
  })

  return kebutuhanGuru
}
