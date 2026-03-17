'use client'
// src/components/layout/Breadcrumb.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: Props) {
  return (
    <nav className="mb-4 flex items-center gap-1 rounded-xl border border-gray-100 bg-white px-4 py-2 shadow-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-[#FDF0F0] hover:text-[#C0272D]"
      >
        <Home size={12} />
        <span>Dashboard</span>
      </Link>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <ChevronRight size={12} className="text-gray-300" />
          {item.href && idx < items.length - 1 ? (
            <Link
              href={item.href}
              className="rounded-lg px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-[#FDF0F0] hover:text-[#C0272D]"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                'rounded-lg px-2 py-1 text-xs font-medium',
                idx === items.length - 1
                  ? 'bg-[#FDF0F0] text-[#C0272D]'
                  : 'text-gray-400'
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}