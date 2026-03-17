-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN_PUSAT', 'ADMIN_SEKOLAH');

-- CreateEnum
CREATE TYPE "JenisSekolah" AS ENUM ('SMA', 'SMK', 'SLB');

-- CreateEnum
CREATE TYPE "StatusGuru" AS ENUM ('PNS', 'PPPK', 'HONORER', 'GTT');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "TingkatKelas" AS ENUM ('X', 'XI', 'XII');

-- CreateEnum
CREATE TYPE "StatusAktif" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "statusAktif" "StatusAktif" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sekolahId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kabupaten" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kabupaten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sekolah" (
    "id" TEXT NOT NULL,
    "npsn" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisSekolah" "JenisSekolah" NOT NULL,
    "alamat" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "kepalaSekolah" TEXT,
    "nip" TEXT,
    "kabupatenId" TEXT NOT NULL,
    "statusAktif" "StatusAktif" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sekolah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jabatan" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "statusAktif" "StatusAktif" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_organisasi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "deskripsi" TEXT,
    "sekolahId" TEXT NOT NULL,
    "parentId" TEXT,
    "statusAktif" "StatusAktif" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_organisasi_jabatan" (
    "id" TEXT NOT NULL,
    "unitOrganisasiId" TEXT NOT NULL,
    "jabatanId" TEXT NOT NULL,
    "jumlahFormasi" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_organisasi_jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_pelajaran" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisSekolah" "JenisSekolah"[],
    "jamPerMinggu" INTEGER NOT NULL DEFAULT 0,
    "deskripsi" TEXT,
    "statusAktif" "StatusAktif" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mata_pelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guru" (
    "id" TEXT NOT NULL,
    "nip" TEXT,
    "nuptk" TEXT,
    "nama" TEXT NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "pendidikanTerakhir" TEXT,
    "jurusan" TEXT,
    "statusGuru" "StatusGuru" NOT NULL,
    "tmtPengangkatan" TIMESTAMP(3),
    "noSk" TEXT,
    "sekolahId" TEXT NOT NULL,
    "jabatanId" TEXT,
    "mataPelajaranId" TEXT,
    "jumlahJamMengajar" INTEGER NOT NULL DEFAULT 0,
    "statusAktif" "StatusAktif" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rombongan_belajar" (
    "id" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "tingkat" "TingkatKelas" NOT NULL,
    "jumlahRombel" INTEGER NOT NULL,
    "jumlahSiswa" INTEGER NOT NULL DEFAULT 0,
    "sekolahId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rombongan_belajar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rombongan_belajar_mapel" (
    "id" TEXT NOT NULL,
    "rombonganBelajarId" TEXT NOT NULL,
    "mataPelajaranId" TEXT NOT NULL,
    "jamPerMinggu" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rombongan_belajar_mapel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kebutuhan_guru" (
    "id" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "totalGuruAda" INTEGER NOT NULL DEFAULT 0,
    "totalGuruDibutuhkan" INTEGER NOT NULL DEFAULT 0,
    "totalKekurangan" INTEGER NOT NULL DEFAULT 0,
    "totalKelebihan" INTEGER NOT NULL DEFAULT 0,
    "statusHitung" BOOLEAN NOT NULL DEFAULT false,
    "tanggalHitung" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kebutuhan_guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kebutuhan_guru_detail" (
    "id" TEXT NOT NULL,
    "kebutuhanGuruId" TEXT NOT NULL,
    "mataPelajaranId" TEXT NOT NULL,
    "jumlahRombel" INTEGER NOT NULL DEFAULT 0,
    "jamPerMinggu" INTEGER NOT NULL DEFAULT 0,
    "totalJamDibutuhkan" INTEGER NOT NULL DEFAULT 0,
    "jumlahGuruDibutuhkan" INTEGER NOT NULL DEFAULT 0,
    "jumlahGuruAda" INTEGER NOT NULL DEFAULT 0,
    "kekurangan" INTEGER NOT NULL DEFAULT 0,
    "kelebihan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kebutuhan_guru_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anjab" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "namaJabatan" TEXT NOT NULL,
    "ikhtisar" TEXT,
    "kualifikasi" TEXT,
    "tugasPokok" TEXT,
    "bahanKerja" TEXT,
    "perangkatKerja" TEXT,
    "hasilKerja" TEXT,
    "tanggungjawab" TEXT,
    "wewenang" TEXT,
    "korelasi" TEXT,
    "kondisiLingkungan" TEXT,
    "resikoKerja" TEXT,
    "syaratJabatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anjab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anjab_detail" (
    "id" TEXT NOT NULL,
    "anjabId" TEXT NOT NULL,
    "jabatanId" TEXT NOT NULL,
    "uraianTugas" TEXT NOT NULL,
    "waktuKerja" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anjab_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abk" (
    "id" TEXT NOT NULL,
    "anjabId" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "namaJabatan" TEXT NOT NULL,
    "volumeBebanKerja" INTEGER NOT NULL DEFAULT 0,
    "normaWaktu" INTEGER NOT NULL DEFAULT 0,
    "waktePenyelesaian" INTEGER NOT NULL DEFAULT 0,
    "pegawaiDibutuhkan" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pegawaiAda" INTEGER NOT NULL DEFAULT 0,
    "kekurangan" INTEGER NOT NULL DEFAULT 0,
    "kelebihan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengaturan_sistem" (
    "id" TEXT NOT NULL,
    "kunci" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,
    "label" TEXT,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengaturan_sistem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "modul" TEXT NOT NULL,
    "dataId" TEXT,
    "dataBefore" JSONB,
    "dataAfter" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kabupaten_kode_key" ON "kabupaten"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "sekolah_npsn_key" ON "sekolah"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "jabatan_kode_key" ON "jabatan"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "unit_organisasi_jabatan_unitOrganisasiId_jabatanId_key" ON "unit_organisasi_jabatan"("unitOrganisasiId", "jabatanId");

-- CreateIndex
CREATE UNIQUE INDEX "mata_pelajaran_kode_key" ON "mata_pelajaran"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "guru_nip_key" ON "guru"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "guru_nuptk_key" ON "guru"("nuptk");

-- CreateIndex
CREATE UNIQUE INDEX "rombongan_belajar_sekolahId_tahunAjaran_tingkat_key" ON "rombongan_belajar"("sekolahId", "tahunAjaran", "tingkat");

-- CreateIndex
CREATE UNIQUE INDEX "rombongan_belajar_mapel_rombonganBelajarId_mataPelajaranId_key" ON "rombongan_belajar_mapel"("rombonganBelajarId", "mataPelajaranId");

-- CreateIndex
CREATE UNIQUE INDEX "kebutuhan_guru_sekolahId_tahunAjaran_key" ON "kebutuhan_guru"("sekolahId", "tahunAjaran");

-- CreateIndex
CREATE UNIQUE INDEX "kebutuhan_guru_detail_kebutuhanGuruId_mataPelajaranId_key" ON "kebutuhan_guru_detail"("kebutuhanGuruId", "mataPelajaranId");

-- CreateIndex
CREATE UNIQUE INDEX "pengaturan_sistem_kunci_key" ON "pengaturan_sistem"("kunci");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sekolah" ADD CONSTRAINT "sekolah_kabupatenId_fkey" FOREIGN KEY ("kabupatenId") REFERENCES "kabupaten"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_organisasi" ADD CONSTRAINT "unit_organisasi_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_organisasi" ADD CONSTRAINT "unit_organisasi_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "unit_organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_organisasi_jabatan" ADD CONSTRAINT "unit_organisasi_jabatan_unitOrganisasiId_fkey" FOREIGN KEY ("unitOrganisasiId") REFERENCES "unit_organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_organisasi_jabatan" ADD CONSTRAINT "unit_organisasi_jabatan_jabatanId_fkey" FOREIGN KEY ("jabatanId") REFERENCES "jabatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru" ADD CONSTRAINT "guru_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru" ADD CONSTRAINT "guru_jabatanId_fkey" FOREIGN KEY ("jabatanId") REFERENCES "jabatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru" ADD CONSTRAINT "guru_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "mata_pelajaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rombongan_belajar" ADD CONSTRAINT "rombongan_belajar_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rombongan_belajar_mapel" ADD CONSTRAINT "rombongan_belajar_mapel_rombonganBelajarId_fkey" FOREIGN KEY ("rombonganBelajarId") REFERENCES "rombongan_belajar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rombongan_belajar_mapel" ADD CONSTRAINT "rombongan_belajar_mapel_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "mata_pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kebutuhan_guru" ADD CONSTRAINT "kebutuhan_guru_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kebutuhan_guru_detail" ADD CONSTRAINT "kebutuhan_guru_detail_kebutuhanGuruId_fkey" FOREIGN KEY ("kebutuhanGuruId") REFERENCES "kebutuhan_guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kebutuhan_guru_detail" ADD CONSTRAINT "kebutuhan_guru_detail_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "mata_pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anjab_detail" ADD CONSTRAINT "anjab_detail_anjabId_fkey" FOREIGN KEY ("anjabId") REFERENCES "anjab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anjab_detail" ADD CONSTRAINT "anjab_detail_jabatanId_fkey" FOREIGN KEY ("jabatanId") REFERENCES "jabatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abk" ADD CONSTRAINT "abk_anjabId_fkey" FOREIGN KEY ("anjabId") REFERENCES "anjab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
