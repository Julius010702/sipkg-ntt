'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, Users, BookOpen, Layers, GraduationCap,
  Calculator, FileText, School, FileBarChart,
  Settings, UserCog, ChevronRight, Building2, ClipboardList,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  href: string
  label: string
  icon: React.ElementType
  roles: ('ADMIN_PUSAT' | 'ADMIN_SEKOLAH')[]
}

const menuItems: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN_PUSAT', 'ADMIN_SEKOLAH'] },
  { href: '/jabatan', label: 'Jabatan', icon: UserCog, roles: ['ADMIN_SEKOLAH'] },
  { href: '/unit-organisasi', label: 'Unit Organisasi', icon: Building2, roles: ['ADMIN_SEKOLAH'] },
  { href: '/guru', label: 'Data Guru', icon: GraduationCap, roles: ['ADMIN_SEKOLAH'] },
  { href: '/mata-pelajaran', label: 'Mata Pelajaran', icon: BookOpen, roles: ['ADMIN_SEKOLAH'] },
  { href: '/rombongan-belajar', label: 'Rombongan Belajar', icon: Layers, roles: ['ADMIN_SEKOLAH'] },
  { href: '/perhitungan', label: 'Perhitungan Kebutuhan', icon: Calculator, roles: ['ADMIN_SEKOLAH'] },
  { href: '/laporan', label: 'Laporan Sekolah', icon: FileText, roles: ['ADMIN_SEKOLAH'] },
  { href: '/data-sekolah', label: 'Data Sekolah', icon: School, roles: ['ADMIN_PUSAT'] },
  { href: '/anjab', label: 'ANJAB & ABK', icon: ClipboardList, roles: ['ADMIN_PUSAT'] },
  { href: '/monitoring', label: 'Monitoring', icon: Activity, roles: ['ADMIN_PUSAT'] },
  { href: '/laporan-provinsi', label: 'Laporan Provinsi', icon: FileBarChart, roles: ['ADMIN_PUSAT'] },
  { href: '/pengaturan/user', label: 'Pengaturan User', icon: Users, roles: ['ADMIN_PUSAT'] },
  { href: '/pengaturan/sistem', label: 'Pengaturan Sistem', icon: Settings, roles: ['ADMIN_PUSAT'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const avatar = (session?.user as any)?.avatar
  const name = session?.user?.name
  const email = session?.user?.email
  const initial = name?.[0]?.toUpperCase() ?? 'U'

  const filteredMenu = menuItems.filter((item) => item.roles.includes(role))

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 shadow-sm">

      {/* Logo area */}
      <div className="relative overflow-hidden border-b border-gray-100 px-5 h-[64px] flex items-center">
        {/* Garis aksen emas di bawah */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-[#C0272D] via-[#D4A017] to-transparent" />
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl shadow-sm">
            {avatar ? (
              <img src={avatar} alt="foto profil" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#C0272D] to-[#8B1A1E]">
                <span className="text-xs font-bold text-white">SP</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-gray-900">SIPKG NTT</p>
            <p className="text-[11px] leading-tight text-gray-400">Kebutuhan Guru</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      {role && (
        <div className="mx-3 mt-4 rounded-xl border border-[#C0272D]/15 bg-gradient-to-r from-[#FDF0F0] to-[#FFFBF0] px-3 py-2.5">
          <p className="text-xs font-semibold text-[#C0272D]">
            {role === 'ADMIN_PUSAT' ? '🏛️ Admin Pusat' : '🏫 Admin Sekolah'}
          </p>
          {(session?.user as any)?.namaSekolah && (
            <p className="mt-0.5 truncate text-[11px] text-[#D4A017]">
              {(session?.user as any).namaSekolah}
            </p>
          )}
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {filteredMenu.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-[#C0272D] to-[#8B1A1E] text-white shadow-sm shadow-[#C0272D]/20'
                  : 'text-gray-500 hover:bg-[#FDF0F0] hover:text-[#C0272D]'
              )}
            >
              <Icon
                size={17}
                className={cn(
                  'flex-shrink-0 transition-transform duration-150 group-hover:scale-110',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#C0272D]'
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <ChevronRight size={13} className="text-white/70" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer user info */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-[#C0272D]/20">
            {avatar ? (
              <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#C0272D] to-[#8B1A1E]">
                <span className="text-[10px] font-bold text-white">{initial}</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-700">{name}</p>
            <p className="truncate text-[10px] text-gray-400">{email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}