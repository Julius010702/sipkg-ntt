// prisma/seed.ts
// Seeder data awal SIPKG NTT

import { PrismaClient, Role, JenisSekolah, StatusGuru, StatusAktif } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding SIPKG NTT database...')

  // ─── Kabupaten NTT ───
  const kabupatenData = [
    { kode: '5301', nama: 'Kupang' },
    { kode: '5302', nama: 'Timor Tengah Selatan' },
    { kode: '5303', nama: 'Timor Tengah Utara' },
    { kode: '5304', nama: 'Belu' },
    { kode: '5305', nama: 'Alor' },
    { kode: '5306', nama: 'Lembata' },
    { kode: '5307', nama: 'Flores Timur' },
    { kode: '5308', nama: 'Sikka' },
    { kode: '5309', nama: 'Ende' },
    { kode: '5310', nama: 'Ngada' },
    { kode: '5311', nama: 'Manggarai' },
    { kode: '5312', nama: 'Rote Ndao' },
    { kode: '5313', nama: 'Manggarai Barat' },
    { kode: '5314', nama: 'Sumba Timur' },
    { kode: '5315', nama: 'Sumba Tengah' },
    { kode: '5316', nama: 'Sumba Barat' },
    { kode: '5317', nama: 'Sumba Barat Daya' },
    { kode: '5318', nama: 'Nagekeo' },
    { kode: '5319', nama: 'Manggarai Timur' },
    { kode: '5320', nama: 'Sabu Raijua' },
    { kode: '5321', nama: 'Malaka' },
    { kode: '5371', nama: 'Kota Kupang' },
  ]

  for (const k of kabupatenData) {
    await prisma.kabupaten.upsert({
      where: { kode: k.kode },
      update: {},
      create: k,
    })
  }
  console.log('✅ Kabupaten seeded')

  // ─── Jabatan ───
  const jabatanData = [
    { kode: 'KS', nama: 'Kepala Sekolah', deskripsi: 'Pemimpin satuan pendidikan' },
    { kode: 'WKS-KUR', nama: 'Wakasek Kurikulum', deskripsi: 'Wakil Kepala Sekolah Bidang Kurikulum' },
    { kode: 'WKS-KESIS', nama: 'Wakasek Kesiswaan', deskripsi: 'Wakil Kepala Sekolah Bidang Kesiswaan' },
    { kode: 'WKS-SAR', nama: 'Wakasek Sarana', deskripsi: 'Wakil Kepala Sekolah Bidang Sarana Prasarana' },
    { kode: 'WKS-HUM', nama: 'Wakasek Humas', deskripsi: 'Wakil Kepala Sekolah Bidang Hubungan Masyarakat' },
    { kode: 'GURU-MAPEL', nama: 'Guru Mata Pelajaran', deskripsi: 'Guru pengampu mata pelajaran' },
    { kode: 'GURU-BK', nama: 'Guru BK/Konselor', deskripsi: 'Guru Bimbingan dan Konseling' },
    { kode: 'WALI-KELAS', nama: 'Wali Kelas', deskripsi: 'Guru yang bertanggung jawab atas kelas' },
    { kode: 'KAPROG', nama: 'Kepala Program Keahlian', deskripsi: 'Untuk SMK - Kepala Program Keahlian' },
    { kode: 'TU-KA', nama: 'Kepala Tata Usaha', deskripsi: 'Kepala Tata Usaha Sekolah' },
  ]

  for (const j of jabatanData) {
    await prisma.jabatan.upsert({
      where: { kode: j.kode },
      update: {},
      create: j,
    })
  }
  console.log('✅ Jabatan seeded')

  // ─── Mata Pelajaran ───
  const mataPelajaranData = [
    // Umum (SMA + SMK)
    { kode: 'PAI', nama: 'Pendidikan Agama Islam', jamPerMinggu: 3 },
    { kode: 'PKN', nama: 'Pendidikan Kewarganegaraan', jamPerMinggu: 2 },
    { kode: 'BIND', nama: 'Bahasa Indonesia', jamPerMinggu: 4 },
    { kode: 'MTK', nama: 'Matematika', jamPerMinggu: 4 },
    { kode: 'SEJ-IND', nama: 'Sejarah Indonesia', jamPerMinggu: 2 },
    { kode: 'BING', nama: 'Bahasa Inggris', jamPerMinggu: 3 },
    { kode: 'SENBUD', nama: 'Seni Budaya', jamPerMinggu: 2 },
    { kode: 'PJOK', nama: 'PJOK', jamPerMinggu: 3 },
    { kode: 'PRAKARYA', nama: 'Prakarya dan Kewirausahaan', jamPerMinggu: 2 },
    // IPA/IPS SMA
    { kode: 'FIS', nama: 'Fisika', jamPerMinggu: 4 },
    { kode: 'KIM', nama: 'Kimia', jamPerMinggu: 4 },
    { kode: 'BIO', nama: 'Biologi', jamPerMinggu: 4 },
    { kode: 'GEO', nama: 'Geografi', jamPerMinggu: 4 },
    { kode: 'EKO', nama: 'Ekonomi', jamPerMinggu: 4 },
    { kode: 'SOS', nama: 'Sosiologi', jamPerMinggu: 3 },
    { kode: 'SEJ-PEM', nama: 'Sejarah Peminatan', jamPerMinggu: 3 },
    { kode: 'MTK-PEM', nama: 'Matematika Peminatan', jamPerMinggu: 4 },
    // BK
    { kode: 'BK', nama: 'Bimbingan Konseling', jamPerMinggu: 1 },
  ]

  for (const mp of mataPelajaranData) {
    await prisma.mataPelajaran.upsert({
      where: { kode: mp.kode },
      update: {},
      create: mp,
    })
  }
  console.log('✅ Mata Pelajaran seeded')

  // ─── Admin Pusat ───
  const passwordHash = await bcrypt.hash('sipkg2024', 10)

  await prisma.user.upsert({
    where: { email: 'admin@nttprov.go.id' },
    update: {},
    create: {
      nama: 'Admin Pusat SIPKG NTT',
      email: 'admin@nttprov.go.id',
      password: passwordHash,
      role: Role.ADMIN_PUSAT,
      statusAktif: StatusAktif.AKTIF,
    },
  })
  console.log('✅ Admin Pusat seeded')

  // ─── Sekolah Contoh ───
  const kabKupang = await prisma.kabupaten.findUnique({ where: { kode: '5371' } })
  
  if (kabKupang) {
    const sekolah = await prisma.sekolah.upsert({
      where: { npsn: '50300073' },
      update: {},
      create: {
        npsn: '50300073',
        nama: 'SMA Negeri 1 Kupang',
        jenisSekolah: JenisSekolah.SMA,
        alamat: 'Jl. El Tari No. 1, Kupang',
        telepon: '(0380) 821234',
        email: 'sman1kupang@nttprov.go.id',
        kepalaSekolah: 'Drs. Yohanes Klau, M.Pd',
        kabupatenId: kabKupang.id,
      },
    })

    // Admin Sekolah Contoh
    const passwordAdminSek = await bcrypt.hash('sekolah2024', 10)
    await prisma.user.upsert({
      where: { email: 'admin.sman1kupang@nttprov.go.id' },
      update: {},
      create: {
        nama: 'Admin SMAN 1 Kupang',
        email: 'admin.sman1kupang@nttprov.go.id',
        password: passwordAdminSek,
        role: Role.ADMIN_SEKOLAH,
        sekolahId: sekolah.id,
        statusAktif: StatusAktif.AKTIF,
      },
    })

    console.log('✅ Sekolah contoh & Admin Sekolah seeded')
  }

  // ─── Pengaturan Sistem ───
  const pengaturan = [
    { kunci: 'TAHUN_AKTIF', nilai: '2024/2025', label: 'Tahun Ajaran Aktif' },
    { kunci: 'JAM_MENGAJAR_WAJIB', nilai: '24', label: 'Jam Mengajar Wajib per Minggu' },
    { kunci: 'NAMA_SISTEM', nilai: 'SIPKG NTT', label: 'Nama Sistem' },
    { kunci: 'NAMA_INSTANSI', nilai: 'Pemerintah Provinsi Nusa Tenggara Timur', label: 'Nama Instansi' },
    { kunci: 'NAMA_DINAS', nilai: 'Biro Organisasi Setda NTT', label: 'Nama Dinas/Biro' },
  ]

  for (const p of pengaturan) {
    await prisma.pengaturanSistem.upsert({
      where: { kunci: p.kunci },
      update: {},
      create: p,
    })
  }
  console.log('✅ Pengaturan sistem seeded')

  console.log('\n🎉 Seeding selesai!')
  console.log('📧 Admin Pusat: admin@nttprov.go.id | Password: sipkg2024')
  console.log('📧 Admin Sekolah: admin.sman1kupang@nttprov.go.id | Password: sekolah2024')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
