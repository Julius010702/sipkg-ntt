
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  nama: 'nama',
  email: 'email',
  password: 'password',
  role: 'role',
  avatar: 'avatar',
  statusAktif: 'statusAktif',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  sekolahId: 'sekolahId'
};

exports.Prisma.KabupatenScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  nama: 'nama',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SekolahScalarFieldEnum = {
  id: 'id',
  npsn: 'npsn',
  nama: 'nama',
  jenisSekolah: 'jenisSekolah',
  alamat: 'alamat',
  telepon: 'telepon',
  email: 'email',
  kepalaSekolah: 'kepalaSekolah',
  nip: 'nip',
  kabupatenId: 'kabupatenId',
  statusAktif: 'statusAktif',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JabatanScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  nama: 'nama',
  indukJabatan: 'indukJabatan',
  unitOrganisasi: 'unitOrganisasi',
  jenisJabatan: 'jenisJabatan',
  namaUrusan: 'namaUrusan',
  pangkatTerendah: 'pangkatTerendah',
  pangkatTertinggi: 'pangkatTertinggi',
  pendidikanTerendah: 'pendidikanTerendah',
  pendidikanTertinggi: 'pendidikanTertinggi',
  jurusanTerendah: 'jurusanTerendah',
  jurusanTertinggi: 'jurusanTertinggi',
  deskripsi: 'deskripsi',
  statusAktif: 'statusAktif',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UnitOrganisasiScalarFieldEnum = {
  id: 'id',
  nama: 'nama',
  kode: 'kode',
  deskripsi: 'deskripsi',
  sekolahId: 'sekolahId',
  parentId: 'parentId',
  statusAktif: 'statusAktif',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UnitOrganisasiJabatanScalarFieldEnum = {
  id: 'id',
  unitOrganisasiId: 'unitOrganisasiId',
  jabatanId: 'jabatanId',
  jumlahFormasi: 'jumlahFormasi',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MataPelajaranScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  nama: 'nama',
  jenisSekolah: 'jenisSekolah',
  jamPerMinggu: 'jamPerMinggu',
  deskripsi: 'deskripsi',
  statusAktif: 'statusAktif',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GuruScalarFieldEnum = {
  id: 'id',
  nip: 'nip',
  nuptk: 'nuptk',
  nama: 'nama',
  jenisKelamin: 'jenisKelamin',
  tempatLahir: 'tempatLahir',
  tanggalLahir: 'tanggalLahir',
  pendidikanTerakhir: 'pendidikanTerakhir',
  jurusan: 'jurusan',
  statusGuru: 'statusGuru',
  tmtPengangkatan: 'tmtPengangkatan',
  noSk: 'noSk',
  sekolahId: 'sekolahId',
  jabatanId: 'jabatanId',
  mataPelajaranId: 'mataPelajaranId',
  jumlahJamMengajar: 'jumlahJamMengajar',
  statusAktif: 'statusAktif',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RombonganBelajarScalarFieldEnum = {
  id: 'id',
  tahunAjaran: 'tahunAjaran',
  tingkat: 'tingkat',
  jumlahRombel: 'jumlahRombel',
  jumlahSiswa: 'jumlahSiswa',
  sekolahId: 'sekolahId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RombonganBelajarMapelScalarFieldEnum = {
  id: 'id',
  rombonganBelajarId: 'rombonganBelajarId',
  mataPelajaranId: 'mataPelajaranId',
  jamPerMinggu: 'jamPerMinggu',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KebutuhanGuruScalarFieldEnum = {
  id: 'id',
  tahunAjaran: 'tahunAjaran',
  sekolahId: 'sekolahId',
  totalGuruAda: 'totalGuruAda',
  totalGuruDibutuhkan: 'totalGuruDibutuhkan',
  totalKekurangan: 'totalKekurangan',
  totalKelebihan: 'totalKelebihan',
  statusHitung: 'statusHitung',
  tanggalHitung: 'tanggalHitung',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KebutuhanGuruDetailScalarFieldEnum = {
  id: 'id',
  kebutuhanGuruId: 'kebutuhanGuruId',
  mataPelajaranId: 'mataPelajaranId',
  jumlahRombel: 'jumlahRombel',
  jamPerMinggu: 'jamPerMinggu',
  totalJamDibutuhkan: 'totalJamDibutuhkan',
  jumlahGuruDibutuhkan: 'jumlahGuruDibutuhkan',
  jumlahGuruAda: 'jumlahGuruAda',
  kekurangan: 'kekurangan',
  kelebihan: 'kelebihan',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AnjabScalarFieldEnum = {
  id: 'id',
  tahun: 'tahun',
  namaJabatan: 'namaJabatan',
  ikhtisar: 'ikhtisar',
  kualifikasi: 'kualifikasi',
  tugasPokok: 'tugasPokok',
  bahanKerja: 'bahanKerja',
  perangkatKerja: 'perangkatKerja',
  hasilKerja: 'hasilKerja',
  tanggungjawab: 'tanggungjawab',
  wewenang: 'wewenang',
  korelasi: 'korelasi',
  kondisiLingkungan: 'kondisiLingkungan',
  resikoKerja: 'resikoKerja',
  syaratJabatan: 'syaratJabatan',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AnjabDetailScalarFieldEnum = {
  id: 'id',
  anjabId: 'anjabId',
  jabatanId: 'jabatanId',
  uraianTugas: 'uraianTugas',
  waktuKerja: 'waktuKerja',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AbkScalarFieldEnum = {
  id: 'id',
  anjabId: 'anjabId',
  tahun: 'tahun',
  namaJabatan: 'namaJabatan',
  volumeBebanKerja: 'volumeBebanKerja',
  normaWaktu: 'normaWaktu',
  waktePenyelesaian: 'waktePenyelesaian',
  pegawaiDibutuhkan: 'pegawaiDibutuhkan',
  pegawaiAda: 'pegawaiAda',
  kekurangan: 'kekurangan',
  kelebihan: 'kelebihan',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PengaturanSistemScalarFieldEnum = {
  id: 'id',
  kunci: 'kunci',
  nilai: 'nilai',
  label: 'label',
  deskripsi: 'deskripsi',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  aksi: 'aksi',
  modul: 'modul',
  dataId: 'dataId',
  dataBefore: 'dataBefore',
  dataAfter: 'dataAfter',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  ADMIN_PUSAT: 'ADMIN_PUSAT',
  ADMIN_SEKOLAH: 'ADMIN_SEKOLAH'
};

exports.StatusAktif = exports.$Enums.StatusAktif = {
  AKTIF: 'AKTIF',
  NONAKTIF: 'NONAKTIF'
};

exports.JenisSekolah = exports.$Enums.JenisSekolah = {
  SMA: 'SMA',
  SMK: 'SMK',
  SLB: 'SLB'
};

exports.JenisKelamin = exports.$Enums.JenisKelamin = {
  L: 'L',
  P: 'P'
};

exports.StatusGuru = exports.$Enums.StatusGuru = {
  PNS: 'PNS',
  PPPK: 'PPPK',
  HONORER: 'HONORER',
  GTT: 'GTT'
};

exports.TingkatKelas = exports.$Enums.TingkatKelas = {
  X: 'X',
  XI: 'XI',
  XII: 'XII'
};

exports.Prisma.ModelName = {
  User: 'User',
  Kabupaten: 'Kabupaten',
  Sekolah: 'Sekolah',
  Jabatan: 'Jabatan',
  UnitOrganisasi: 'UnitOrganisasi',
  UnitOrganisasiJabatan: 'UnitOrganisasiJabatan',
  MataPelajaran: 'MataPelajaran',
  Guru: 'Guru',
  RombonganBelajar: 'RombonganBelajar',
  RombonganBelajarMapel: 'RombonganBelajarMapel',
  KebutuhanGuru: 'KebutuhanGuru',
  KebutuhanGuruDetail: 'KebutuhanGuruDetail',
  Anjab: 'Anjab',
  AnjabDetail: 'AnjabDetail',
  Abk: 'Abk',
  PengaturanSistem: 'PengaturanSistem',
  AuditLog: 'AuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
