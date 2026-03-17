'use client'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { LogOut, Bell, User, X, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jabatan': 'Jabatan',
  '/unit-organisasi': 'Unit Organisasi',
  '/guru': 'Data Guru',
  '/mata-pelajaran': 'Mata Pelajaran',
  '/rombongan-belajar': 'Rombongan Belajar',
  '/perhitungan': 'Perhitungan Kebutuhan Guru',
  '/laporan': 'Laporan Sekolah',
  '/data-sekolah': 'Data Sekolah',
  '/anjab': 'ANJAB & ABK',
  '/monitoring': 'Monitoring Kebutuhan Guru',
  '/laporan-provinsi': 'Laporan Provinsi',
  '/pengaturan/user': 'Pengaturan User',
  '/pengaturan/sistem': 'Pengaturan Sistem',
  '/profil': 'Profil Saya',
}

// Tipe notifikasi
type NotifType = 'info' | 'warning' | 'success'

interface Notification {
  id: number
  type: NotifType
  title: string
  message: string
  time: string
  read: boolean
}

// Data notifikasi contoh — ganti dengan data dari API/server
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Sekolah Belum Hitung',
    message: '12 sekolah belum melakukan perhitungan kebutuhan guru tahun ini.',
    time: '5 menit lalu',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'Data Guru Diperbarui',
    message: 'SMAN 1 Kupang telah memperbarui data guru mata pelajaran Matematika.',
    time: '1 jam lalu',
    read: false,
  },
  {
    id: 3,
    type: 'success',
    title: 'Laporan Selesai',
    message: 'Laporan kebutuhan guru provinsi NTT berhasil digenerate.',
    time: '3 jam lalu',
    read: false,
  },
  {
    id: 4,
    type: 'info',
    title: 'Tahun Ajaran Baru',
    message: 'Tahun ajaran 2024/2025 telah aktif. Silakan perbarui data.',
    time: 'Kemarin',
    read: true,
  },
]

const notifIcon: Record<NotifType, React.ReactNode> = {
  info: <Info size={14} className="text-blue-500" />,
  warning: <AlertTriangle size={14} className="text-amber-500" />,
  success: <CheckCircle size={14} className="text-green-500" />,
}

const notifBg: Record<NotifType, string> = {
  info: 'bg-blue-50',
  warning: 'bg-amber-50',
  success: 'bg-green-50',
}

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)

  const notifRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const pageTitle =
    Object.entries(routeLabels).find(([key]) => pathname.startsWith(key))?.[1] ?? 'SIPKG NTT'

  const avatar = (session?.user as any)?.avatar
  const name = session?.user?.name
  const email = session?.user?.email
  const initial = name?.[0]?.toUpperCase() ?? 'U'

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Tandai semua sudah dibaca
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Tandai satu notifikasi sudah dibaca
  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  // Hapus notifikasi
  const removeNotif = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 h-[64px] shadow-sm backdrop-blur-sm md:px-6">
      {/* Left: page title */}
      <div className="flex items-center gap-3">
        <span className="hidden h-8 w-[3px] rounded-full bg-gradient-to-b from-[#C0272D] to-[#D4A017] md:block" />
        <div>
          <h1 className="text-sm font-bold text-gray-900 md:text-base">{pageTitle}</h1>
          <p className="hidden text-xs text-gray-400 md:block">
            {(session?.user as any)?.namaSekolah ?? 'Pemerintah Provinsi NTT'}
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">

        {/* ── Bell Notification ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotif((v) => !v)
              setShowMenu(false)
            }}
            className="relative rounded-xl p-2 text-gray-400 transition-colors hover:bg-[#FDF0F0] hover:text-[#C0272D]"
            aria-label="Notifikasi"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C0272D] ring-2 ring-white">
                <span className="text-[9px] font-bold text-white leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </button>

          {/* Notifikasi Dropdown */}
          {showNotif && (
            <>
              {/* Overlay mobile */}
              <div
                className="fixed inset-0 z-40 bg-black/20 md:hidden"
                onClick={() => setShowNotif(false)}
              />

              <div
                className={`
                  fixed z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60
                  /* Mobile: full width dari bawah */
                  bottom-0 left-0 right-0 max-h-[80vh]
                  /* Desktop: dropdown pojok kanan */
                  md:absolute md:bottom-auto md:left-auto md:right-0 md:top-11 md:w-80 md:max-h-[480px]
                `}
              >
                {/* Header notifikasi */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#FDF0F0] to-[#FFFBF0] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell size={15} className="text-[#C0272D]" />
                    <span className="text-sm font-semibold text-gray-800">Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[#C0272D] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-gray-500 transition-colors hover:bg-white hover:text-[#C0272D]"
                      >
                        <CheckCheck size={12} />
                        Tandai dibaca
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotif(false)}
                      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white hover:text-gray-600 md:hidden"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* List notifikasi */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 110px)' }}>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                      <Bell size={28} className="text-gray-200" />
                      <p className="text-sm text-gray-400">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markRead(notif.id)}
                        className={`
                          relative flex cursor-pointer gap-3 border-b border-gray-50 px-4 py-3
                          transition-colors hover:bg-gray-50
                          ${!notif.read ? 'bg-[#FFFBF9]' : 'bg-white'}
                        `}
                      >
                        {/* Icon type */}
                        <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${notifBg[notif.type]}`}>
                          {notifIcon[notif.type]}
                        </div>

                        {/* Konten */}
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-gray-500 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-400">{notif.time}</p>
                        </div>

                        {/* Dot unread */}
                        {!notif.read && (
                          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#C0272D]" />
                        )}

                        {/* Tombol hapus */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotif(notif.id)
                          }}
                          className="absolute right-3 top-2 rounded-md p-0.5 text-gray-300 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-500 group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t border-gray-100 px-4 py-2.5 text-center">
                    <button className="text-xs font-medium text-[#C0272D] hover:underline">
                      Lihat semua notifikasi
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Avatar dropdown ── */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setShowMenu((v) => !v)
              setShowNotif(false)
            }}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-50"
          >
            <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-[#C0272D]/20">
              {avatar ? (
                <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#C0272D] to-[#8B1A1E]">
                  <span className="text-xs font-bold text-white">{initial}</span>
                </div>
              )}
            </div>
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 md:block">
              {name}
            </span>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-[#FDF0F0] to-[#FFFBF0] px-4 py-3">
                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-[#C0272D]/20">
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#C0272D] to-[#8B1A1E]">
                      <span className="text-sm font-bold text-white">{initial}</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                  <p className="truncate text-xs text-gray-400">{email}</p>
                </div>
              </div>

              <div className="py-1">
                <a
                  href="/profil"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={() => setShowMenu(false)}
                >
                  <User size={15} className="text-gray-400" />
                  Profil Saya
                </a>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#C0272D] transition-colors hover:bg-[#FDF0F0]"
                >
                  <LogOut size={15} />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}