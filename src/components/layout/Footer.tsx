// src/components/layout/Footer.tsx
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-8 border-t border-[#C0272D]/10">
      <div className="flex flex-col items-center justify-between gap-2 px-2 py-4 sm:flex-row">
        {/* Kiri: logo teks + nama sistem */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#C0272D] to-[#8B1A1E]">
            <span className="text-[10px] font-bold text-white">NTT</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 leading-tight">SIPKG NTT</p>
            <p className="text-[10px] text-gray-400 leading-tight">Sistem Informasi Perhitungan Kebutuhan Guru</p>
          </div>
        </div>

        {/* Tengah: garis emas dekoratif — hanya desktop */}
        <div className="hidden h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-[#D4A017] to-transparent sm:block" />

        {/* Kanan: copyright */}
        <p className="text-center text-[11px] text-gray-400">
          © {year} Dinas Pendidikan &amp; Kebudayaan{' '}
          <span className="font-medium text-[#C0272D]">Provinsi NTT</span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  )
}