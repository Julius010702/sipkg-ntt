# SIPKG NTT
## Sistem Informasi Perhitungan Kebutuhan Guru
### Pemerintah Provinsi Nusa Tenggara Timur

---

## 🚀 Cara Instalasi

### Prasyarat
- Node.js 18+
- PostgreSQL 14+
- npm atau yarn

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/pemprov-ntt/sipkg-ntt.git
cd sipkg-ntt
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit file `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/sipkg_ntt_db?schema=public"
NEXTAUTH_SECRET="buat-string-acak-panjang-di-sini"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
# Buat database di PostgreSQL
createdb sipkg_ntt_db

# Generate Prisma Client
npm run db:generate

# Jalankan migrasi
npm run db:migrate

# Isi data awal (seed)
npm run db:seed
```

### 4. Jalankan Aplikasi

```bash
# Mode development
npm run dev

# Mode production
npm run build
npm run start
```

Buka: http://localhost:3000

---

## 👤 Akun Default (Setelah Seeding)

| Role          | Email                              | Password     |
|---------------|------------------------------------|--------------|
| Admin Pusat   | admin@nttprov.go.id                | sipkg2024    |
| Admin Sekolah | admin.sman1kupang@nttprov.go.id    | sekolah2024  |

> ⚠️ **Ganti password setelah login pertama!**

---

## 🗂️ Struktur Modul

### Admin Sekolah
| Menu                    | Keterangan                                    |
|-------------------------|-----------------------------------------------|
| Dashboard               | Ringkasan data & status perhitungan sekolah   |
| Jabatan                 | Kelola data jabatan guru                      |
| Unit Organisasi         | Kelola unit kerja di sekolah                  |
| Data Guru               | Input, edit, hapus data guru                  |
| Mata Pelajaran          | Daftar mata pelajaran                         |
| Rombongan Belajar       | Input rombel per kelas & tahun ajaran         |
| Perhitungan Kebutuhan   | Trigger kalkulasi otomatis kebutuhan guru     |
| Laporan Sekolah         | Cetak laporan kebutuhan guru                  |

### Admin Pusat (Setda/Biro Organisasi)
| Menu                    | Keterangan                                    |
|-------------------------|-----------------------------------------------|
| Dashboard               | Statistik & grafik seluruh provinsi           |
| Data Sekolah            | Kelola data SMA, SMK, SLB se-NTT              |
| ANJAB & ABK             | Analisis Jabatan & Analisis Beban Kerja       |
| Monitoring              | Pantau kebutuhan guru per sekolah/kabupaten   |
| Laporan Provinsi        | Rekap & ekspor laporan provinsi               |
| Pengaturan User         | Kelola akun admin sekolah                     |
| Pengaturan Sistem       | Parameter tahun ajaran & jam mengajar         |

---

## 📐 Formula Perhitungan Kebutuhan Guru

```
Total Jam Dibutuhkan  = Jumlah Rombel × Jam Mapel per Minggu
Guru Dibutuhkan       = CEILING(Total Jam / Jam Mengajar Wajib)
Kekurangan            = MAX(0, Guru Dibutuhkan - Guru Ada)
Kelebihan             = MAX(0, Guru Ada - Guru Dibutuhkan)
```

- **Jam Mengajar Wajib**: 24 jam tatap muka/minggu (dapat diubah di Pengaturan Sistem)

---

## 🛠️ Teknologi

| Layer      | Teknologi                              |
|------------|----------------------------------------|
| Frontend   | Next.js 14 (App Router), React 18      |
| Styling    | Tailwind CSS                           |
| Database   | PostgreSQL 14+                         |
| ORM        | Prisma 5                               |
| Auth       | NextAuth v5 (JWT)                      |
| Validasi   | Zod + React Hook Form                  |
| Chart      | Recharts                               |
| Export     | xlsx (Excel), Print CSS (PDF)          |

---

## 📞 Kontak

**Biro Organisasi Setda Provinsi NTT**
Jl. El Tari No. 52, Kupang, NTT

---

© 2024 Pemerintah Provinsi Nusa Tenggara Timur
