'use client'
// src/components/layout/MobileNav.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, GraduationCap, Calculator,
  FileText, School, Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  const adminSekolahNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/guru', label: 'Guru', icon: GraduationCap },
    { href: '/perhitungan', label: 'Hitung', icon: Calculator },
    { href: '/laporan', label: 'Laporan', icon: FileText },
  ]

  const adminPusatNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/data-sekolah', label: 'Sekolah', icon: School },
    { href: '/monitoring', label: 'Monitoring', icon: Activity },
    { href: '/laporan-provinsi', label: 'Laporan', icon: FileText },
  ]

  const navItems = role === 'ADMIN_PUSAT' ? adminPusatNav : adminSekolahNav

  return (
    <nav className="safe-area-pb fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-[11px] font-medium transition-colors',
                isActive ? 'text-[#C0272D]' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {/* Active top indicator */}
              {isActive && (
                <span className="absolute top-0 h-[2px] w-10 rounded-b-full bg-gradient-to-r from-[#C0272D] to-[#D4A017]" />
              )}

              {/* Icon container */}
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150',
                  isActive ? 'bg-[#FDF0F0] scale-110' : ''
                )}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-[#C0272D]' : 'text-gray-400'}
                />
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}