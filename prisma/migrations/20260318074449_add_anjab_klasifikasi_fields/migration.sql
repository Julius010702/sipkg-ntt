-- AlterTable
ALTER TABLE "anjab" ADD COLUMN     "indukJabatan" TEXT,
ADD COLUMN     "jenisJabatan" TEXT,
ADD COLUMN     "jurusanTerendah" TEXT,
ADD COLUMN     "jurusanTertinggi" TEXT,
ADD COLUMN     "kodeJabatan" TEXT,
ADD COLUMN     "namaUrusan" TEXT,
ADD COLUMN     "pangkatTerendah" TEXT,
ADD COLUMN     "pangkatTertinggi" TEXT,
ADD COLUMN     "pendidikanTerendah" TEXT,
ADD COLUMN     "pendidikanTertinggi" TEXT,
ADD COLUMN     "sekolahId" TEXT,
ADD COLUMN     "unitOrganisasi" TEXT;

-- AddForeignKey
ALTER TABLE "anjab" ADD CONSTRAINT "anjab_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
