// src/app/api/jabatan/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.jabatan.findUnique({ where: { id: params.id } })
    if (!data) return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const {
      kode, nama,
      indukJabatan, unitOrganisasi, jenisJabatan, namaUrusan,
      pangkatTerendah, pangkatTertinggi,
      pendidikanTerendah, pendidikanTertinggi,
      jurusanTerendah, jurusanTertinggi,
      deskripsi,
    } = body

    if (!kode || !nama) {
      return NextResponse.json({ error: 'Kode dan nama jabatan wajib diisi' }, { status: 400 })
    }

    const data = await prisma.jabatan.update({
      where: { id: params.id },
      data: {
        kode,
        nama,
        indukJabatan:        indukJabatan        ?? null,
        unitOrganisasi:      unitOrganisasi       ?? null,
        jenisJabatan:        jenisJabatan         ?? null,
        namaUrusan:          namaUrusan           ?? null,
        pangkatTerendah:     pangkatTerendah      ?? null,
        pangkatTertinggi:    pangkatTertinggi     ?? null,
        pendidikanTerendah:  pendidikanTerendah   ?? null,
        pendidikanTertinggi: pendidikanTertinggi  ?? null,
        jurusanTerendah:     jurusanTerendah      ?? null,
        jurusanTertinggi:    jurusanTertinggi     ?? null,
        deskripsi:           deskripsi            ?? null,
      },
    })

    return NextResponse.json({ data })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Kode jabatan sudah digunakan' }, { status: 409 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.jabatan.update({
      where: { id: params.id },
      data: { statusAktif: 'NONAKTIF' },
    })
    return NextResponse.json({ message: 'Jabatan berhasil dihapus' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 })
  }
}