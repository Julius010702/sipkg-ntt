// src/app/api/anjab/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.anjab.findUnique({
      where: { id: params.id },
      include: {
        sekolah: { select: { id: true, nama: true, npsn: true } },
        abk: { orderBy: { createdAt: 'asc' } },
        detail: { include: { jabatan: true } },
      },
    })
    if (!data) return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const {
      tahun, namaJabatan, kodeJabatan,
      indukJabatan, unitOrganisasi, jenisJabatan, namaUrusan,
      pangkatTerendah, pangkatTertinggi,
      pendidikanTerendah, pendidikanTertinggi,
      jurusanTerendah, jurusanTertinggi,
      ikhtisar, kualifikasi, tugasPokok, bahanKerja,
      perangkatKerja, hasilKerja, tanggungjawab,
      wewenang, korelasi, kondisiLingkungan, resikoKerja, syaratJabatan,
      sekolahId,
    } = body

    if (!namaJabatan || !tahun) {
      return NextResponse.json({ error: 'Nama jabatan dan tahun wajib diisi' }, { status: 400 })
    }

    const data = await prisma.anjab.update({
      where: { id: params.id },
      data: {
        tahun:               Number(tahun),
        namaJabatan,
        kodeJabatan:         kodeJabatan         ?? null,
        indukJabatan:        indukJabatan         ?? null,
        unitOrganisasi:      unitOrganisasi       ?? null,
        jenisJabatan:        jenisJabatan         ?? null,
        namaUrusan:          namaUrusan           ?? null,
        pangkatTerendah:     pangkatTerendah      ?? null,
        pangkatTertinggi:    pangkatTertinggi     ?? null,
        pendidikanTerendah:  pendidikanTerendah   ?? null,
        pendidikanTertinggi: pendidikanTertinggi  ?? null,
        jurusanTerendah:     jurusanTerendah      ?? null,
        jurusanTertinggi:    jurusanTertinggi     ?? null,
        ikhtisar:            ikhtisar             ?? null,
        kualifikasi:         kualifikasi          ?? null,
        tugasPokok:          tugasPokok           ?? null,
        bahanKerja:          bahanKerja           ?? null,
        perangkatKerja:      perangkatKerja       ?? null,
        hasilKerja:          hasilKerja           ?? null,
        tanggungjawab:       tanggungjawab        ?? null,
        wewenang:            wewenang             ?? null,
        korelasi:            korelasi             ?? null,
        kondisiLingkungan:   kondisiLingkungan    ?? null,
        resikoKerja:         resikoKerja          ?? null,
        syaratJabatan:       syaratJabatan        ?? null,
        sekolahId:           sekolahId            ?? null,
      },
    })

    return NextResponse.json({ data })
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Hapus ABK dan detail terkait dulu
    await prisma.abk.deleteMany({ where: { anjabId: params.id } })
    await prisma.anjabDetail.deleteMany({ where: { anjabId: params.id } })
    await prisma.anjab.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Data ANJAB berhasil dihapus' })
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 })
  }
}