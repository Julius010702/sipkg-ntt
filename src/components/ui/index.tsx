// src/components/ui/index.tsx
'use client'
import { cn } from '@/lib/utils'
import { X, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { ReactNode } from 'react'

// ─── BUTTON ───
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#C0272D] to-[#8B1A1E] hover:from-[#A01F24] hover:to-[#6B1216] text-white shadow-sm shadow-[#C0272D]/20 disabled:from-[#C0272D]/50 disabled:to-[#8B1A1E]/50',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-gradient-to-r from-[#C0272D] to-[#8B1A1E] hover:from-[#A01F24] hover:to-[#6B1216] text-white',
    ghost: 'hover:bg-[#FDF0F0] text-gray-700 hover:text-[#C0272D]',
    outline: 'border border-[#C0272D]/30 hover:bg-[#FDF0F0] hover:border-[#C0272D] text-[#C0272D]',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}

// ─── INPUT ───
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={cn(
          'w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-all duration-150',
          'focus:ring-2 focus:ring-[#C0272D]/20 focus:border-[#C0272D]',
          error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

// ─── SELECT ───
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={cn(
          'w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-all duration-150 bg-white',
          'focus:ring-2 focus:ring-[#C0272D]/20 focus:border-[#C0272D]',
          error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ─── BADGE ───
interface BadgeProps {
  children: ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple'
}

export function Badge({ children, color = 'blue' }: BadgeProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
    green: 'bg-green-50 text-green-700 ring-1 ring-green-200/60',
    red: 'bg-[#FDF0F0] text-[#C0272D] ring-1 ring-[#C0272D]/20',
    yellow: 'bg-[#FFFBF0] text-[#7A5A00] ring-1 ring-[#D4A017]/25',
    gray: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200/60',
    purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200/60',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', colors[color])}>
      {children}
    </span>
  )
}

// ─── CARD ───
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-100 flex items-center gap-2', className)}>
      {/* Aksen garis merah kiri */}
      <span className="w-[3px] h-4 rounded-full bg-gradient-to-b from-[#C0272D] to-[#D4A017] flex-shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

// ─── STAT CARD ───
interface StatCardProps {
  label: string
  value: number | string
  icon?: ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  subtitle?: string
}

export function StatCard({ label, value, icon, color = 'blue', subtitle }: StatCardProps) {
  const colors = {
    blue: {
      wrap: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      accent: 'from-blue-500 to-blue-600',
    },
    green: {
      wrap: 'bg-green-50 text-green-600',
      border: 'border-green-100',
      accent: 'from-green-500 to-green-600',
    },
    red: {
      wrap: 'bg-[#FDF0F0] text-[#C0272D]',
      border: 'border-[#C0272D]/10',
      accent: 'from-[#C0272D] to-[#8B1A1E]',
    },
    yellow: {
      wrap: 'bg-[#FFFBF0] text-[#9A7010]',
      border: 'border-[#D4A017]/15',
      accent: 'from-[#D4A017] to-[#9A7010]',
    },
    purple: {
      wrap: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
      accent: 'from-purple-500 to-purple-600',
    },
  }
  const c = colors[color]
  return (
    <div className={cn('relative bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all duration-200', c.border)}>
      {/* Top accent line */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r', c.accent)} />
      <div className="flex items-center gap-3.5 px-4 py-4">
        {icon && (
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', c.wrap)}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400 truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
          {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── TABLE ───
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-gray-100', className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn(
      'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide',
      'bg-gradient-to-r from-[#FDF0F0] to-gray-50 border-b border-gray-100',
      className
    )}>
      {children}
    </th>
  )
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 text-sm text-gray-700 border-b border-gray-50', className)}>
      {children}
    </td>
  )
}

// ─── MODAL ───
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden', sizes[size])}>
        {/* Modal header accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C0272D] via-[#D4A017] to-[#C0272D]" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#FDF0F0] text-gray-400 hover:text-[#C0272D] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ─── PAGINATION ───
interface PaginationProps {
  page: number
  totalPage: number
  onPageChange: (p: number) => void
}

export function Pagination({ page, totalPage, onPageChange }: PaginationProps) {
  if (totalPage <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
      <p className="text-xs text-gray-400">
        Halaman <span className="font-semibold text-gray-600">{page}</span> dari{' '}
        <span className="font-semibold text-gray-600">{totalPage}</span>
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-[#FDF0F0] hover:border-[#C0272D]/30 hover:text-[#C0272D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPage}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-[#FDF0F0] hover:border-[#C0272D]/30 hover:text-[#C0272D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── ALERT ───
interface AlertProps {
  type?: 'info' | 'success' | 'error' | 'warning'
  message: string
}

export function Alert({ type = 'info', message }: AlertProps) {
  const styles = {
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: <Info size={16} /> },
    success: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: <CheckCircle size={16} /> },
    error: { bg: 'bg-[#FDF0F0] border-[#C0272D]/20', text: 'text-[#C0272D]', icon: <AlertCircle size={16} /> },
    warning: { bg: 'bg-[#FFFBF0] border-[#D4A017]/25', text: 'text-[#7A5A00]', icon: <AlertCircle size={16} /> },
  }
  const s = styles[type]
  return (
    <div className={cn('flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium', s.bg, s.text)}>
      <span className="flex-shrink-0 mt-0.5">{s.icon}</span>
      <p>{message}</p>
    </div>
  )
}

// ─── SPINNER ───
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className={cn('border-2 border-[#C0272D] border-t-transparent rounded-full animate-spin', sizes[size])} />
  )
}

// ─── EMPTY STATE ───
export function EmptyState({ message = 'Tidak ada data', icon }: { message?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-gray-400">
      {icon && (
        <div className="mb-3 p-4 rounded-2xl bg-[#FDF0F0] text-[#C0272D]/40">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-gray-400">{message}</p>
    </div>
  )
}