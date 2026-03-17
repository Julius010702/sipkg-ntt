// src/lib/validations/index.ts
import { z } from 'zod'

// ─── AUTH ───
export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

// ─── USER ───
export const createUserSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['ADMIN_PUSAT', 'ADMIN_SEKOLAH']),
  sekolahId: z.string().optional().nullable(),
})

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .extend({ password: z.string().min(6).optional().or(z.literal('')) })

// ─── SEKOLAH ───
export const sekolahSchema = z.object({
  npsn: z.string().length(8, 'NPSN harus 8 digit'),
  nama: z.string().min(3, 'Nama sekolah wajib diisi'),
  jenisSekolah: z.enum(['SMA', 'SMK', 'SLB']),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  kepalaSekolah: z.string().optional(),
  nip: z.string().optional(),
  kabupatenId: z.string().min(1, 'Kabupaten wajib dipilih'),
})

// ─── JABATAN ───
export const jabatanSchema = z.object({
  kode: z.string().min(2, 'Kode jabatan wajib diisi'),
  nama: z.string().min(3, 'Nama jabatan wajib diisi'),
  deskripsi: z.string().optional(),
})

// ─── UNIT ORGANISASI ───
export const unitOrganisasiSchema = z.object({
  nama: z.string().min(3, 'Nama unit wajib diisi'),
  kode: z.string().optional(),
  deskripsi: z.string().optional(),
  parentId: z.string().optional().nullable(),
})

// ─── MATA PELAJARAN ───
export const mataPelajaranSchema = z.object({
  kode: z.string().min(2, 'Kode mapel wajib diisi'),
  nama: z.string().min(3, 'Nama mapel wajib diisi'),
  jamPerMinggu: z.number().int().min(1).max(10),
  deskripsi: z.string().optional(),
})

// ─── GURU ───
export const guruSchema = z.object({
  nip: z.string().optional().nullable(),
  nuptk: z.string().optional().nullable(),
  nama: z.string().min(3, 'Nama guru wajib diisi'),
  jenisKelamin: z.enum(['L', 'P']),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional().nullable(),
  pendidikanTerakhir: z.string().optional(),
  jurusan: z.string().optional(),
  statusGuru: z.enum(['PNS', 'PPPK', 'HONORER', 'GTT']),
  tmtPengangkatan: z.string().optional().nullable(),
  noSk: z.string().optional(),
  jabatanId: z.string().optional().nullable(),
  mataPelajaranId: z.string().optional().nullable(),
  jumlahJamMengajar: z.number().int().min(0).max(40).default(0),
})

// ─── ROMBONGAN BELAJAR ───
export const rombonganBelajarSchema = z.object({
  tahunAjaran: z.string().regex(/^\d{4}\/\d{4}$/, 'Format: 2024/2025'),
  tingkat: z.enum(['X', 'XI', 'XII']),
  jumlahRombel: z.number().int().min(1).max(50),
  jumlahSiswa: z.number().int().min(0).default(0),
})

// ─── KEBUTUHAN GURU (trigger hitung) ───
export const hitungKebutuhanSchema = z.object({
  sekolahId: z.string().min(1),
  tahunAjaran: z.string().regex(/^\d{4}\/\d{4}$/),
})

// ─── ANJAB ───
export const anjabSchema = z.object({
  tahun: z.number().int().min(2020).max(2030),
  namaJabatan: z.string().min(3),
  ikhtisar: z.string().optional(),
  kualifikasi: z.string().optional(),
  tugasPokok: z.string().optional(),
  hasilKerja: z.string().optional(),
  tanggungjawab: z.string().optional(),
  wewenang: z.string().optional(),
  syaratJabatan: z.string().optional(),
})

// ─── PENGATURAN SISTEM ───
export const pengaturanSistemSchema = z.object({
  kunci: z.string().min(1),
  nilai: z.string().min(1, 'Nilai wajib diisi'),
  label: z.string().optional(),
  deskripsi: z.string().optional(),
})
