'use client'
import { useState, useEffect } from 'react'

export function RealtimeClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!now) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  const namaHari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][now.getDay()]
  const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][now.getMonth()]
  const tanggal = now.getDate()
  const tahun = now.getFullYear()
  const mingguKe = Math.ceil(tanggal / 7)

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#C0272D] via-[#A01F24] to-[#8B1A1E] rounded-2xl px-5 py-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm shadow-[#C0272D]/20">
      {/* Dekorasi lingkaran subtle */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-4 right-32 h-16 w-16 rounded-full bg-[#D4A017]/10" />
      {/* Garis emas bawah */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4A017] via-[#FFD66B] to-[#D4A017]" />

      <div className="relative z-10">
        <p className="text-white font-semibold text-sm">
          {namaHari}, {tanggal} {namaBulan} {tahun}
        </p>
        <p className="text-white/60 text-xs mt-0.5">
          Minggu ke-{mingguKe} · Bulan {namaBulan} · Tahun {tahun}
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-1.5">
        {[
          { val: pad(now.getHours()), label: 'Jam' },
          { val: pad(now.getMinutes()), label: 'Menit' },
          { val: pad(now.getSeconds()), label: 'Detik' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[#D4A017] font-bold text-xl">:</span>}
            <div className="bg-black/20 rounded-xl px-3 py-1.5 text-center min-w-[48px] ring-1 ring-white/10">
              <p className="text-white font-mono font-bold text-xl leading-none">{item.val}</p>
              <p className="text-white/50 text-[10px] mt-0.5">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}