// middleware.ts
// Proteksi route berdasarkan role

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Route yang boleh diakses tanpa login
const publicRoutes = ['/login']

// Route khusus Admin Pusat
const adminPusatRoutes = [
  '/data-sekolah',
  '/anjab',
  '/monitoring',
  '/laporan-provinsi',
  '/pengaturan',
]

// Route khusus Admin Sekolah
const adminSekolahRoutes = [
  '/jabatan',
  '/unit-organisasi',
  '/guru',
  '/mata-pelajaran',
  '/rombongan-belajar',
  '/perhitungan',
  '/laporan',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bypass public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Cek token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Tidak ada token → redirect ke login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role as string

  // Cek akses Admin Pusat
  if (adminPusatRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== 'ADMIN_PUSAT') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Cek akses Admin Sekolah
  if (adminSekolahRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== 'ADMIN_SEKOLAH') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
