// src/lib/export/excel.ts
// Utility untuk export data ke file Excel (.xlsx)

import * as XLSX from 'xlsx'

/**
 * Export laporan kebutuhan guru sekolah ke Excel
 */
export function exportLaporanSekolah(laporan: {
  sekolah: any
  tahunAjaran: string
  kebutuhan: any
  guruList: any[]
  rombel: any[]
}) {
  const wb = XLSX.utils.book_new()
  const { sekolah, tahunAjaran, kebutuhan, guruList, rombel } = laporan

  // ─── Sheet 1: Identitas & Rekap ───
  const rekapData: any[][] = [
    ['LAPORAN ANALISIS KEBUTUHAN GURU'],
    [`${sekolah.nama} — Tahun Ajaran ${tahunAjaran}`],
    [],
    ['IDENTITAS SEKOLAH'],
    ['Nama Sekolah', sekolah.nama],
    ['NPSN', sekolah.npsn],
    ['Jenis Sekolah', sekolah.jenisSekolah],
    ['Kabupaten/Kota', sekolah.kabupaten?.nama ?? '-'],
    ['Alamat', sekolah.alamat ?? '-'],
    ['Kepala Sekolah', sekolah.kepalaSekolah ?? '-'],
    ['NIP', sekolah.nip ?? '-'],
    [],
    ['REKAP KEBUTUHAN GURU'],
    ['Total Guru Ada', kebutuhan?.totalGuruAda ?? 0],
    ['Total Guru Dibutuhkan', kebutuhan?.totalGuruDibutuhkan ?? 0],
    ['Total Kekurangan', kebutuhan?.totalKekurangan ?? 0],
    ['Total Kelebihan', kebutuhan?.totalKelebihan ?? 0],
  ]

  const wsRekap = XLSX.utils.aoa_to_sheet(rekapData)
  wsRekap['!cols'] = [{ wch: 25 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap')

  // ─── Sheet 2: Detail per Mata Pelajaran ───
  if (kebutuhan?.detail) {
    const detailHeader = [
      'No', 'Mata Pelajaran', 'Jml Rombel', 'Jam/Minggu',
      'Total Jam', 'Guru Dibutuhkan', 'Guru Ada', 'Kekurangan', 'Kelebihan', 'Status'
    ]
    const detailRows = kebutuhan.detail.map((d: any, i: number) => {
      const selisih = d.jumlahGuruAda - d.jumlahGuruDibutuhkan
      return [
        i + 1,
        d.mataPelajaran?.nama ?? '-',
        d.jumlahRombel,
        d.jamPerMinggu,
        d.totalJamDibutuhkan,
        d.jumlahGuruDibutuhkan,
        d.jumlahGuruAda,
        d.kekurangan,
        d.kelebihan,
        selisih < 0 ? `Kurang ${Math.abs(selisih)}` : selisih > 0 ? `Lebih ${selisih}` : 'Cukup',
      ]
    })

    const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailRows])
    wsDetail['!cols'] = [
      { wch: 5 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    ]
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Kebutuhan Guru')
  }

  // ─── Sheet 3: Data Guru ───
  const guruHeader = ['No', 'Nama Guru', 'NIP', 'NUPTK', 'Jenis Kelamin', 'Status Kepegawaian', 'Jabatan', 'Mata Pelajaran', 'Jam/Minggu']
  const guruRows = guruList.map((g: any, i: number) => [
    i + 1,
    g.nama,
    g.nip ?? '-',
    g.nuptk ?? '-',
    g.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    g.statusGuru,
    g.jabatan?.nama ?? '-',
    g.mataPelajaran?.nama ?? '-',
    g.jumlahJamMengajar,
  ])
  const wsGuru = XLSX.utils.aoa_to_sheet([guruHeader, ...guruRows])
  wsGuru['!cols'] = [
    { wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 18 },
    { wch: 14 }, { wch: 18 }, { wch: 25 }, { wch: 30 }, { wch: 12 },
  ]
  XLSX.utils.book_append_sheet(wb, wsGuru, 'Data Guru')

  // ─── Sheet 4: Rombongan Belajar ───
  const rombelHeader = ['No', 'Tingkat', 'Jumlah Rombel', 'Jumlah Siswa']
  const rombelRows = rombel.map((r: any, i: number) => [
    i + 1, `Kelas ${r.tingkat}`, r.jumlahRombel, r.jumlahSiswa,
  ])
  const wsRombel = XLSX.utils.aoa_to_sheet([rombelHeader, ...rombelRows])
  XLSX.utils.book_append_sheet(wb, wsRombel, 'Rombongan Belajar')

  // Simpan file
  const fileName = `Laporan_Kebutuhan_Guru_${sekolah.npsn}_${tahunAjaran.replace('/', '-')}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export laporan provinsi ke Excel
 */
export function exportLaporanProvinsi(laporan: {
  tahunAjaran: string
  jenisSekolah: string
  rekapKabupaten: any[]
  rekapMapel: any[]
}) {
  const wb = XLSX.utils.book_new()
  const { tahunAjaran, jenisSekolah, rekapKabupaten, rekapMapel } = laporan

  // ─── Sheet 1: Rekap per Kabupaten ───
  const kabHeader = [
    'No', 'Kabupaten/Kota', 'Total Sekolah', 'Sudah Hitung',
    'Guru Ada', 'Guru Dibutuhkan', 'Kekurangan', 'Kelebihan'
  ]
  const kabRows = rekapKabupaten.map((k: any, i: number) => [
    i + 1,
    k.kabupaten.nama,
    k.totalSekolah,
    k.sekolahSudahHitung,
    k.totalGuruAda,
    k.totalGuruDibutuhkan,
    k.totalKekurangan,
    k.totalKelebihan,
  ])

  // Baris total
  kabRows.push([
    '', 'TOTAL PROVINSI NTT',
    rekapKabupaten.reduce((s, k) => s + k.totalSekolah, 0),
    rekapKabupaten.reduce((s, k) => s + k.sekolahSudahHitung, 0),
    rekapKabupaten.reduce((s, k) => s + k.totalGuruAda, 0),
    rekapKabupaten.reduce((s, k) => s + k.totalGuruDibutuhkan, 0),
    rekapKabupaten.reduce((s, k) => s + k.totalKekurangan, 0),
    rekapKabupaten.reduce((s, k) => s + k.totalKelebihan, 0),
  ])

  const wsKab = XLSX.utils.aoa_to_sheet([
    [`REKAP KEBUTUHAN GURU PER KABUPATEN/KOTA — PROVINSI NTT`],
    [`Tahun Ajaran: ${tahunAjaran} | Jenis: ${jenisSekolah}`],
    [],
    kabHeader,
    ...kabRows,
  ])
  wsKab['!cols'] = [
    { wch: 5 }, { wch: 35 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 12 },
  ]
  XLSX.utils.book_append_sheet(wb, wsKab, 'Rekap Kabupaten')

  // ─── Sheet 2: Rekap per Mata Pelajaran ───
  const mapelHeader = [
    'No', 'Mata Pelajaran', 'Guru Dibutuhkan', 'Guru Ada', 'Kekurangan', 'Kelebihan', 'Status'
  ]
  const mapelRows = [...rekapMapel]
    .sort((a, b) => (b.kekurangan ?? 0) - (a.kekurangan ?? 0))
    .map((m: any, i: number) => [
      i + 1,
      m.mataPelajaran?.nama ?? '-',
      m.jumlahGuruDibutuhkan ?? 0,
      m.jumlahGuruAda ?? 0,
      m.kekurangan ?? 0,
      m.kelebihan ?? 0,
      (m.kekurangan ?? 0) > 0 ? `Kurang ${m.kekurangan}` : (m.kelebihan ?? 0) > 0 ? `Lebih ${m.kelebihan}` : 'Cukup',
    ])

  const wsMapel = XLSX.utils.aoa_to_sheet([
    [`REKAP KEBUTUHAN GURU PER MATA PELAJARAN`],
    [],
    mapelHeader,
    ...mapelRows,
  ])
  wsMapel['!cols'] = [
    { wch: 5 }, { wch: 35 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 16 },
  ]
  XLSX.utils.book_append_sheet(wb, wsMapel, 'Rekap Mapel')

  const fileName = `Laporan_Provinsi_NTT_${tahunAjaran.replace('/', '-')}_${jenisSekolah}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export data guru ke Excel
 */
export function exportDataGuru(guruList: any[], namaSekolah: string) {
  const wb = XLSX.utils.book_new()

  const header = [
    'No', 'Nama Guru', 'NIP', 'NUPTK', 'Jenis Kelamin',
    'Tempat Lahir', 'Tanggal Lahir', 'Pendidikan Terakhir', 'Jurusan',
    'Status Kepegawaian', 'Jabatan', 'Mata Pelajaran', 'Jam Mengajar/Minggu', 'No SK',
  ]

  const rows = guruList.map((g: any, i: number) => [
    i + 1,
    g.nama,
    g.nip ?? '-',
    g.nuptk ?? '-',
    g.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    g.tempatLahir ?? '-',
    g.tanggalLahir ? new Date(g.tanggalLahir).toLocaleDateString('id-ID') : '-',
    g.pendidikanTerakhir ?? '-',
    g.jurusan ?? '-',
    g.statusGuru,
    g.jabatan?.nama ?? '-',
    g.mataPelajaran?.nama ?? '-',
    g.jumlahJamMengajar,
    g.noSk ?? '-',
  ])

  const ws = XLSX.utils.aoa_to_sheet([
    [`DATA GURU — ${namaSekolah}`],
    [],
    header,
    ...rows,
  ])

  ws['!cols'] = [
    { wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 18 }, { wch: 14 },
    { wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 20 },
    { wch: 16 }, { wch: 25 }, { wch: 30 }, { wch: 16 }, { wch: 20 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Data Guru')

  const fileName = `Data_Guru_${namaSekolah.replace(/\s+/g, '_')}.xlsx`
  XLSX.writeFile(wb, fileName)
}
