// src/app/api/anjab/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sekolahId = searchParams.get('sekolahId')

    const data = await prisma.anjab.findMany({
      where: sekolahId ? { sekolahId } : {},
      orderBy: { namaJabatan: 'asc' },
      include: {
        sekolah: { select: { id: true, nama: true, npsn: true } },
        abk: true,
      },
    })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('GET anjab error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    const data = await prisma.anjab.create({
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

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('POST anjab error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 })
  }
}