// src/hooks/useAuth.ts
import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user as any
  const isAdminPusat = user?.role === 'ADMIN_PUSAT'
  const isAdminSekolah = user?.role === 'ADMIN_SEKOLAH'
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'

  return {
    session,
    user,
    role: user?.role ?? null,
    sekolahId: user?.sekolahId ?? null,
    namaSekolah: user?.namaSekolah ?? null,
    isAdminPusat,
    isAdminSekolah,
    isLoading,
    isAuthenticated,
  }
}
