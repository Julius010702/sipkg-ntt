// src/types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: 'ADMIN_PUSAT' | 'ADMIN_SEKOLAH'
      sekolahId?: string | null
      namaSekolah?: string | null
    }
  }

  interface User {
    role: 'ADMIN_PUSAT' | 'ADMIN_SEKOLAH'
    sekolahId?: string | null
    namaSekolah?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN_PUSAT' | 'ADMIN_SEKOLAH'
    sekolahId?: string | null
    namaSekolah?: string | null
  }
}
