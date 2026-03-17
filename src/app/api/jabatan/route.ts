// src/app/api/jabatan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const data = await prisma.jabatan.findMany({
      where: { statusAktif: 'AKTIF' },
      orderBy: { nama: 'asc' },
    })
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    const data = await prisma.jabatan.create({
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

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Kode jabatan sudah digunakan' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 })
  }
}