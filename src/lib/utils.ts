// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatTanggal(date: Date | string | null): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(date))
}

export function formatTanggalPendek(date: Date | string | null): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(date))
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function statusGuruLabel(status: string): string {
  const map: Record<string, string> = {
    PNS: 'PNS',
    PPPK: 'P3K',
    HONORER: 'Honorer',
    GTT: 'GTT',
  }
  return map[status] ?? status
}

export function jenisSekolahLabel(jenis: string): string {
  const map: Record<string, string> = {
    SMA: 'SMA',
    SMK: 'SMK',
    SLB: 'SLB',
  }
  return map[jenis] ?? jenis
}

export function tingkatKelasLabel(tingkat: string): string {
  const map: Record<string, string> = {
    X: 'Kelas X',
    XI: 'Kelas XI',
    XII: 'Kelas XII',
  }
  return map[tingkat] ?? tingkat
}

export function badgeKekurangan(nilai: number) {
  if (nilai > 0) return { label: `Kurang ${nilai}`, color: 'red' }
  if (nilai < 0) return { label: `Lebih ${Math.abs(nilai)}`, color: 'yellow' }
  return { label: 'Cukup', color: 'green' }
}

export function buildPaginationMeta(total: number, page: number, perPage: number) {
  const totalPage = Math.ceil(total / perPage)
  return {
    total,
    page,
    perPage,
    totalPage,
    hasNext: page < totalPage,
    hasPrev: page > 1,
  }
}
