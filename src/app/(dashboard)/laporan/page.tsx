'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardBody, Button, Badge, Spinner } from '@/components/ui'
import {
  Printer, FileText, FileDown, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, Type,
  RotateCcw, RotateCw, Save, X,
} from 'lucide-react'
import { formatTanggal } from '@/lib/utils'

const LOGO_NTT_URL = '/logo-ntt.png'
const LOGO_SEKOLAH_URL = '/logo-sekolah.png'

function ToolbarBtn({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode
}) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors
        ${active ? 'bg-[#C0272D] text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
    >
      {children}
    </button>
  )
}

function Sep() { return <span className="mx-1 h-5 w-px bg-gray-200" /> }

export default function LaporanSekolahPage() {
  const { data: session } = useSession()
  const [laporan, setLaporan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tahunAjaran, setTahunAjaran] = useState('')
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingWord, setExportingWord] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [savedHtml, setSavedHtml] = useState<string | null>(null)
  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false, align: 'left' })

  const editorRef = useRef<HTMLDivElement>(null)
  const sekolahId = (session?.user as any)?.sekolahId

  useEffect(() => {
    fetch('/api/pengaturan-sistem?kunci=TAHUN_AKTIF')
      .then(r => r.json()).then(j => setTahunAjaran(j.data?.nilai ?? ''))
  }, [])

  useEffect(() => {
    if (!sekolahId || !tahunAjaran) return
    setLoading(true)
    fetch(`/api/laporan/sekolah?sekolahId=${sekolahId}&tahunAjaran=${encodeURIComponent(tahunAjaran)}`)
      .then(r => r.json()).then(j => setLaporan(j)).finally(() => setLoading(false))
  }, [sekolahId, tahunAjaran])

  const updateToolbarState = useCallback(() => {
    setFmt({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      align: document.queryCommandState('justifyCenter') ? 'center'
        : document.queryCommandState('justifyRight') ? 'right' : 'left',
    })
  }, [])

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    updateToolbarState()
  }

  const enterEditMode = () => {
    setIsEditMode(true)
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.contentEditable = 'true'
        editorRef.current.focus()
      }
    }, 50)
  }

  const saveEdit = () => {
    if (editorRef.current) {
      setSavedHtml(editorRef.current.innerHTML)
      editorRef.current.contentEditable = 'false'
    }
    setIsEditMode(false)
  }

  const cancelEdit = () => {
    if (editorRef.current) {
      if (savedHtml !== null) editorRef.current.innerHTML = savedHtml
      editorRef.current.contentEditable = 'false'
    }
    setIsEditMode(false)
  }

  const handlePrint = () => window.print()

  const fetchLogoBase64 = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url)
      if (!res.ok) return null
      const blob = await res.blob()
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onloadend = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch { return null }
  }

  // ── Export PDF ──
  const handleExportPdf = async () => {
    if (!laporan) return
    setExportingPdf(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const { sekolah, kebutuhan, guruList, rombel } = laporan
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const margin = 15; let y = 15

      const [logoNttB64, logoSekolahB64] = await Promise.all([
        fetchLogoBase64(LOGO_NTT_URL), fetchLogoBase64(LOGO_SEKOLAH_URL),
      ])
      if (logoSekolahB64) doc.addImage(logoSekolahB64, 'PNG', margin, y - 2, 18, 18)
      if (logoNttB64) doc.addImage(logoNttB64, 'PNG', 210 - margin - 18, y - 2, 18, 18)

      doc.setFontSize(11).setFont('helvetica', 'bold')
      doc.text('PEMERINTAH PROVINSI NUSA TENGGARA TIMUR', 105, y, { align: 'center' }); y += 6
      doc.setFontSize(10).setFont('helvetica', 'normal')
      doc.text('Dinas Pendidikan dan Kebudayaan', 105, y, { align: 'center' }); y += 8
      doc.setFontSize(13).setFont('helvetica', 'bold')
      doc.text('LAPORAN ANALISIS KEBUTUHAN GURU', 105, y, { align: 'center' }); y += 6
      doc.setFontSize(10).setFont('helvetica', 'normal')
      doc.text(`Tahun Ajaran ${tahunAjaran}`, 105, y, { align: 'center' }); y += 3
      doc.setLineWidth(0.7).line(margin, y, 210 - margin, y); y += 7

      // Ambil teks yang sudah diedit dari editor
      const editorText = editorRef.current?.innerText ?? ''
      const kepalaLine = editorText.split('\n').find(l => /Kepala Sekolah\s*:/i.test(l))
      const nipLine = editorText.split('\n').find(l => /NIP Kepala Sekolah\s*:/i.test(l))
      const kepalaVal = kepalaLine?.split(':')?.[1]?.trim() ?? sekolah.kepalaSekolah ?? '-'
      const nipVal = nipLine?.split(':')?.[1]?.trim() ?? sekolah.nip ?? '-'

      doc.setFont('helvetica', 'bold').text('I. IDENTITAS SEKOLAH', margin, y); y += 6
      doc.setFont('helvetica', 'normal')
      ;[['Nama Sekolah', sekolah.nama], ['NPSN', sekolah.npsn], ['Jenis Sekolah', sekolah.jenisSekolah],
        ['Kabupaten/Kota', sekolah.kabupaten?.nama ?? '-'], ['Alamat', sekolah.alamat ?? '-'],
        ['Kepala Sekolah', kepalaVal], ['NIP Kepala Sekolah', nipVal],
      ].forEach(([l, v]) => { doc.text(l, margin + 2, y); doc.text(`: ${v}`, margin + 52, y); y += 5.5 }); y += 3

      doc.setFont('helvetica', 'bold').text('II. DATA ROMBONGAN BELAJAR', margin, y); y += 4
      autoTable(doc, { startY: y, margin: { left: margin, right: margin },
        head: [['Tingkat', 'Jumlah Rombel', 'Jumlah Siswa']],
        body: [...rombel.map((r: any) => [`Kelas ${r.tingkat}`, r.jumlahRombel, r.jumlahSiswa]),
          ['Total', rombel.reduce((s: number, r: any) => s + r.jumlahRombel, 0), rombel.reduce((s: number, r: any) => s + r.jumlahSiswa, 0)]],
        styles: { fontSize: 9 }, headStyles: { fillColor: [37, 99, 235] } })
      y = (doc as any).lastAutoTable.finalY + 8

      if (kebutuhan) {
        doc.setFont('helvetica', 'bold').text('III. ANALISIS KEBUTUHAN GURU PER MATA PELAJARAN', margin, y); y += 4
        autoTable(doc, { startY: y, margin: { left: margin, right: margin },
          head: [['No', 'Mata Pelajaran', 'Rombel', 'Jam/Mgg', 'Total Jam', 'Dibutuhkan', 'Ada', '+/-', 'Ket.']],
          body: [...kebutuhan.detail.map((d: any, i: number) => {
            const s = d.jumlahGuruAda - d.jumlahGuruDibutuhkan
            return [i + 1, d.mataPelajaran?.nama, d.jumlahRombel, d.jamPerMinggu, d.totalJamDibutuhkan, d.jumlahGuruDibutuhkan, d.jumlahGuruAda, s > 0 ? `+${s}` : s, s < 0 ? 'Kurang' : s > 0 ? 'Lebih' : 'Cukup']
          }), ['', 'Total', '', '', '', kebutuhan.totalGuruDibutuhkan, kebutuhan.totalGuruAda, (() => { const s = kebutuhan.totalGuruAda - kebutuhan.totalGuruDibutuhkan; return s > 0 ? `+${s}` : s })(), '']],
          styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] }, columnStyles: { 0: { cellWidth: 8 } } })
        y = (doc as any).lastAutoTable.finalY + 8
      }

      doc.setFont('helvetica', 'bold').text(`IV. DAFTAR GURU (${guruList.length} orang)`, margin, y); y += 4
      autoTable(doc, { startY: y, margin: { left: margin, right: margin },
        head: [['No', 'Nama Guru', 'NIP', 'Status', 'Mata Pelajaran', 'Jam/Mgg']],
        body: guruList.map((g: any, i: number) => [i + 1, g.nama, g.nip ?? '-', g.statusGuru, g.mataPelajaran?.nama ?? '-', g.jumlahJamMengajar]),
        styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] }, columnStyles: { 0: { cellWidth: 8 } } })

      const ttdX = 210 - margin - 50
      y = (doc as any).lastAutoTable.finalY + 12
      doc.setFont('helvetica', 'normal').setFontSize(10)
      doc.text(`${sekolah.kabupaten?.nama ?? 'Kupang'}, ${formatTanggal(new Date())}`, ttdX, y, { align: 'center' })
      doc.text('Kepala Sekolah,', ttdX, y + 6, { align: 'center' })
      doc.text(kepalaVal, ttdX, y + 26, { align: 'center' })
      doc.text(nipVal !== '-' ? `NIP. ${nipVal}` : 'NIP. _______________', ttdX, y + 31, { align: 'center' })

      doc.save(`Laporan_Kebutuhan_Guru_${sekolah.nama}_${tahunAjaran.replace('/', '-')}.pdf`)
    } catch (e) { console.error(e); alert('Gagal export PDF') }
    finally { setExportingPdf(false) }
  }

  // ── Export Word ──
  const handleExportWord = async () => {
    if (!laporan) return
    setExportingWord(true)
    try {
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
        AlignmentType, BorderStyle, WidthType, ImageRun, ShadingType, VerticalAlign } = await import('docx')
      const { sekolah, kebutuhan, guruList, rombel } = laporan

      const [logoNttB64, logoSekolahB64] = await Promise.all([
        fetchLogoBase64(LOGO_NTT_URL), fetchLogoBase64(LOGO_SEKOLAH_URL),
      ])

      // Browser-safe: base64 string → Uint8Array (pengganti Buffer.from yang Node-only)
      const b64ToArr = (b64: string): Uint8Array => {
        const bin = atob(b64)
        const arr = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
        return arr
      }

      const editorText = editorRef.current?.innerText ?? ''
      const kepalaLine = editorText.split('\n').find(l => /Kepala Sekolah\s*:/i.test(l))
      const nipLine = editorText.split('\n').find(l => /NIP Kepala Sekolah\s*:/i.test(l))
      const kepalaVal = kepalaLine?.split(':')?.[1]?.trim() ?? sekolah.kepalaSekolah ?? '-'
      const nipVal = nipLine?.split(':')?.[1]?.trim() ?? sekolah.nip ?? '-'

      const CW = 8200
      const b1 = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
      const borders = { top: b1, bottom: b1, left: b1, right: b1 }
      const nb = { style: BorderStyle.NONE }
      const noBorders = { top: nb, bottom: nb, left: nb, right: nb, insideH: nb, insideV: nb }
      const hb = { style: BorderStyle.SINGLE, size: 1, color: '2563EB' }
      const hBorders = { top: hb, bottom: hb, left: hb, right: hb }

      const cell = (text: string, bold = false, center = false, w?: number) =>
        new TableCell({ borders, margins: { top: 60, bottom: 60, left: 100, right: 100 }, ...(w ? { width: { size: w, type: WidthType.DXA } } : {}), children: [new Paragraph({ alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: String(text ?? '-'), bold, size: 18, font: 'Arial' })] })] })

      const hCell = (text: string, w?: number) =>
        new TableCell({ borders: hBorders, shading: { fill: '2563EB', type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, ...(w ? { width: { size: w, type: WidthType.DXA } } : {}), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18, font: 'Arial' })] })] })

      const cw_k = [400, 2400, 500, 600, 700, 700, 500, 500, 700]
      const cw_g = [400, 2500, 1500, 800, 2000, 700]

      // ── Layout constants ──
      // A4 = 11906 DXA, margins 1.5cm (1701 DXA) each → content = 8504 DXA
      const PAGE_W = 11906
      const MARGIN = 1701   // 1.5 cm
      const CW2 = PAGE_W - MARGIN * 2  // 8504

      // Identitas cols: label | titik dua | nilai
      const ID_LABEL = 2400
      const ID_SEP   = 300
      const ID_VAL   = CW2 - ID_LABEL - ID_SEP  // 5804

      // Rombel cols
      const RB_COLS = [3500, 2500, 2504]

      // Kebutuhan guru cols (total must = sum)
      const KG_COLS = [450, 2300, 550, 650, 750, 750, 550, 550, 954]  // sum = 7504 — ≤ CW2

      // Daftar guru cols
      const DG_COLS = [450, 2600, 1600, 850, 2200, 804]  // sum = 8504

      // ── Border helpers ──
      const bData   = { style: BorderStyle.SINGLE, size: 4,  color: 'CCCCCC' }
      const bHead   = { style: BorderStyle.SINGLE, size: 4,  color: '1d4ed8' }
      const bNone   = { style: BorderStyle.NONE,   size: 0,  color: 'FFFFFF' }
      const dataBorders = { top: bData, bottom: bData, left: bData, right: bData }
      const headBorders = { top: bHead, bottom: bHead, left: bHead, right: bHead }
      const noBord  = { top: bNone, bottom: bNone, left: bNone, right: bNone, insideH: bNone, insideV: bNone }

      // ── Cell builders ──
      const PAD = { top: 80, bottom: 80, left: 120, right: 120 }
      const PAD_SM = { top: 60, bottom: 60, left: 100, right: 100 }

      const dataCell = (text: string, bold = false, center = false, w?: number) =>
        new TableCell({
          borders: dataBorders,
          margins: PAD_SM,
          ...(w != null ? { width: { size: w, type: WidthType.DXA } } : {}),
          children: [new Paragraph({
            alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text: String(text ?? '-'), bold, size: 18, font: 'Arial' })],
          })],
        })

      const headCell = (text: string, w?: number) =>
        new TableCell({
          borders: headBorders,
          shading: { fill: '1d4ed8', type: ShadingType.CLEAR },
          margins: PAD_SM,
          ...(w != null ? { width: { size: w, type: WidthType.DXA } } : {}),
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18, font: 'Arial' })],
          })],
        })

      const noCell = (w?: number) =>
        new TableCell({
          borders: noBord,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          ...(w != null ? { width: { size: w, type: WidthType.DXA } } : {}),
          children: [new Paragraph({ children: [new TextRun('')] })],
        })

      // ── Section heading ──
      const sectionHead = (text: string) =>
        new Paragraph({
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text, bold: true, size: 22, font: 'Arial', underline: {} })],
        })

      // ── Thin divider line ──
      const divider = new Paragraph({
        spacing: { before: 60, after: 60 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '1d4ed8', space: 1 } },
        children: [new TextRun('')],
      })

      const blank = new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun('')] })

      const doc = new Document({
        styles: {
          default: {
            document: { run: { font: 'Arial', size: 20 } },
          },
        },
        sections: [{
          properties: {
            page: {
              size: { width: PAGE_W, height: 16838 },
              margin: { top: 1440, right: MARGIN, bottom: 1440, left: MARGIN },
            },
          },
          children: [

            // ══ HEADER ══
            ...((() => {
              let logoKiri: any = new TextRun('')
              let logoKanan: any = new TextRun('')
              try {
                if (logoSekolahB64) logoKiri = new ImageRun({ data: b64ToArr(logoSekolahB64), transformation: { width: 60, height: 60 }, type: 'png' } as any)
                if (logoNttB64)     logoKanan = new ImageRun({ data: b64ToArr(logoNttB64),    transformation: { width: 60, height: 60 }, type: 'png' } as any)
              } catch (imgErr) { console.warn('Logo skip:', imgErr) }

              return [new Table({
                width: { size: CW2, type: WidthType.DXA },
                columnWidths: [800, CW2 - 1600, 800],
                borders: noBord,
                rows: [new TableRow({ children: [
                  new TableCell({ borders: noBord, verticalAlign: VerticalAlign.CENTER, width: { size: 800, type: WidthType.DXA }, margins: { top: 0, bottom: 0, left: 0, right: 0 }, children: [new Paragraph({ alignment: AlignmentType.LEFT,   children: [logoKiri]  })] }),
                  new TableCell({ borders: noBord, verticalAlign: VerticalAlign.CENTER, width: { size: CW2 - 1600, type: WidthType.DXA }, margins: PAD, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: 'PEMERINTAH PROVINSI NUSA TENGGARA TIMUR', bold: true, size: 24, font: 'Arial' })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: 'Dinas Pendidikan dan Kebudayaan', size: 22, font: 'Arial' })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 }, children: [new TextRun({ text: 'LAPORAN ANALISIS KEBUTUHAN GURU', bold: true, size: 28, font: 'Arial' })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0  }, children: [new TextRun({ text: `Tahun Ajaran ${tahunAjaran}`, size: 20, font: 'Arial' })] }),
                  ] }),
                  new TableCell({ borders: noBord, verticalAlign: VerticalAlign.CENTER, width: { size: 800, type: WidthType.DXA }, margins: { top: 0, bottom: 0, left: 0, right: 0 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT,  children: [logoKanan] })] }),
                ]})]
              })]
            })()),

            divider,
            blank,

            // ══ I. IDENTITAS SEKOLAH ══
            sectionHead('I. IDENTITAS SEKOLAH'),
            new Table({
              width: { size: CW2, type: WidthType.DXA },
              columnWidths: [ID_LABEL, ID_SEP, ID_VAL],
              borders: noBord,
              rows: ([
                ['Nama Sekolah',      sekolah.nama             ?? '-'],
                ['NPSN',              sekolah.npsn             ?? '-'],
                ['Jenis Sekolah',     sekolah.jenisSekolah     ?? '-'],
                ['Kabupaten/Kota',    sekolah.kabupaten?.nama  ?? '-'],
                ['Alamat',            sekolah.alamat           ?? '-'],
                ['Kepala Sekolah',    kepalaVal                        ],
                ['NIP Kepala Sekolah', nipVal                         ],
              ] as [string,string][]).map(([lbl, val]) => new TableRow({ children: [
                new TableCell({ borders: noBord, width: { size: ID_LABEL, type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 0, right: 60 }, children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: lbl, size: 20, font: 'Arial' })] })] }),
                new TableCell({ borders: noBord, width: { size: ID_SEP,   type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 0, right: 0  }, children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: ':',  size: 20, font: 'Arial' })] })] }),
                new TableCell({ borders: noBord, width: { size: ID_VAL,   type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 80, right: 0  }, children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: val, size: 20, font: 'Arial' })] })] }),
              ]})),
            }),
            blank,

            // ══ II. ROMBONGAN BELAJAR ══
            sectionHead('II. DATA ROMBONGAN BELAJAR'),
            new Table({
              width: { size: RB_COLS.reduce((a,b)=>a+b,0), type: WidthType.DXA },
              columnWidths: RB_COLS,
              rows: [
                new TableRow({ tableHeader: true, children: [
                  headCell('Tingkat',       RB_COLS[0]),
                  headCell('Jumlah Rombel', RB_COLS[1]),
                  headCell('Jumlah Siswa',  RB_COLS[2]),
                ]}),
                ...rombel.map((r: any) => new TableRow({ children: [
                  dataCell(`Kelas ${r.tingkat}`, false, false, RB_COLS[0]),
                  dataCell(String(r.jumlahRombel),  false, true,  RB_COLS[1]),
                  dataCell(String(r.jumlahSiswa),   false, true,  RB_COLS[2]),
                ]})),
                new TableRow({ children: [
                  dataCell('Total', true, false, RB_COLS[0]),
                  dataCell(String(rombel.reduce((s:number,r:any)=>s+r.jumlahRombel,0)), true, true, RB_COLS[1]),
                  dataCell(String(rombel.reduce((s:number,r:any)=>s+r.jumlahSiswa,  0)), true, true, RB_COLS[2]),
                ]}),
              ],
            }),
            blank,

            // ══ III. KEBUTUHAN GURU ══
            ...(kebutuhan ? [
              sectionHead('III. ANALISIS KEBUTUHAN GURU PER MATA PELAJARAN'),
              new Table({
                width: { size: KG_COLS.reduce((a,b)=>a+b,0), type: WidthType.DXA },
                columnWidths: KG_COLS,
                rows: [
                  new TableRow({ tableHeader: true, children:
                    ['No','Mata Pelajaran','Rombel','Jam/Mgg','Total Jam','Dibutuhkan','Ada','+/-','Ket.']
                    .map((h,i) => headCell(h, KG_COLS[i]))
                  }),
                  ...kebutuhan.detail.map((d:any, i:number) => {
                    const s = d.jumlahGuruAda - d.jumlahGuruDibutuhkan
                    return new TableRow({ children: [
                      dataCell(String(i+1),                              false, true,  KG_COLS[0]),
                      dataCell(d.mataPelajaran?.nama ?? '-',              false, false, KG_COLS[1]),
                      dataCell(String(d.jumlahRombel),                   false, true,  KG_COLS[2]),
                      dataCell(String(d.jamPerMinggu),                   false, true,  KG_COLS[3]),
                      dataCell(String(d.totalJamDibutuhkan),             false, true,  KG_COLS[4]),
                      dataCell(String(d.jumlahGuruDibutuhkan),           true,  true,  KG_COLS[5]),
                      dataCell(String(d.jumlahGuruAda),                  false, true,  KG_COLS[6]),
                      dataCell(s>0?`+${s}`:String(s),                   true,  true,  KG_COLS[7]),
                      dataCell(s<0?'Kurang':s>0?'Lebih':'Cukup',        false, true,  KG_COLS[8]),
                    ]})
                  }),
                  new TableRow({ children: [
                    dataCell('',      true, false, KG_COLS[0]),
                    dataCell('Total', true, false, KG_COLS[1]),
                    dataCell('', false, false, KG_COLS[2]),
                    dataCell('', false, false, KG_COLS[3]),
                    dataCell('', false, false, KG_COLS[4]),
                    dataCell(String(kebutuhan.totalGuruDibutuhkan), true, true, KG_COLS[5]),
                    dataCell(String(kebutuhan.totalGuruAda),        true, true, KG_COLS[6]),
                    (() => { const s=kebutuhan.totalGuruAda-kebutuhan.totalGuruDibutuhkan; return dataCell(s>0?`+${s}`:String(s),true,true,KG_COLS[7]) })(),
                    dataCell('', false, false, KG_COLS[8]),
                  ]}),
                ],
              }),
              blank,
            ] : []),

            // ══ IV. DAFTAR GURU ══
            sectionHead(`IV. DAFTAR GURU (${guruList.length} orang)`),
            new Table({
              width: { size: DG_COLS.reduce((a,b)=>a+b,0), type: WidthType.DXA },
              columnWidths: DG_COLS,
              rows: [
                new TableRow({ tableHeader: true, children:
                  ['No','Nama Guru','NIP','Status','Mata Pelajaran','Jam/Mgg']
                  .map((h,i) => headCell(h, DG_COLS[i]))
                }),
                ...guruList.map((g:any, i:number) => new TableRow({ children: [
                  dataCell(String(i+1),                  false, true,  DG_COLS[0]),
                  dataCell(g.nama,                       false, false, DG_COLS[1]),
                  dataCell(g.nip ?? '-',                 false, false, DG_COLS[2]),
                  dataCell(g.statusGuru,                 false, true,  DG_COLS[3]),
                  dataCell(g.mataPelajaran?.nama ?? '-', false, false, DG_COLS[4]),
                  dataCell(String(g.jumlahJamMengajar),  false, true,  DG_COLS[5]),
                ]})),
              ],
            }),
            blank,
            blank,

            // ══ TANDA TANGAN ══
            new Table({
              width: { size: CW2, type: WidthType.DXA },
              columnWidths: [CW2 - 3200, 3200],
              borders: noBord,
              rows: [new TableRow({ children: [
                noCell(CW2 - 3200),
                new TableCell({
                  borders: noBord,
                  width: { size: 3200, type: WidthType.DXA },
                  margins: PAD,
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: `${sekolah.kabupaten?.nama ?? 'Kupang'}, ${formatTanggal(new Date())}`, size: 20, font: 'Arial' })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: 'Kepala Sekolah,', size: 20, font: 'Arial' })] }),
                    new Paragraph({ children: [new TextRun('')] }),
                    new Paragraph({ children: [new TextRun('')] }),
                    new Paragraph({ children: [new TextRun('')] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: kepalaVal, bold: true, size: 20, font: 'Arial', underline: {} })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0  }, children: [new TextRun({ text: nipVal !== '-' ? `NIP. ${nipVal}` : 'NIP. _______________', size: 20, font: 'Arial' })] }),
                  ],
                }),
              ]})]
            }),

          ],
        }],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Laporan_Kebutuhan_Guru_${sekolah.nama}_${tahunAjaran.replace('/', '-')}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: any) { console.error('Export Word error:', e?.message ?? e); alert('Gagal export Word: ' + (e?.message ?? String(e))) }
    finally { setExportingWord(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!laporan?.sekolah) return (
    <Card><CardBody><p className="text-sm text-gray-500 text-center py-8">Data laporan tidak tersedia.</p></CardBody></Card>
  )

  const { sekolah, kebutuhan, guruList, rombel } = laporan

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ══ TOOLBAR WORD-STYLE ══ */}
      <div className="print:hidden flex-shrink-0 z-30">

        {/* Bar aksi utama */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Laporan Kebutuhan Guru</h2>
            <p className="text-xs text-gray-400">Tahun Ajaran {tahunAjaran}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {!isEditMode ? (
              <button onClick={enterEditMode}
                className="flex items-center gap-1.5 rounded-lg border border-[#C0272D]/40 bg-[#FDF0F0] px-3 py-1.5 text-xs font-semibold text-[#C0272D] transition hover:bg-[#C0272D] hover:text-white">
                <Type size={13} /> Mulai Edit
              </button>
            ) : (
              <>
                <button onClick={cancelEdit}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50">
                  <X size={13} /> Batal
                </button>
                <button onClick={saveEdit}
                  className="flex items-center gap-1.5 rounded-lg bg-[#C0272D] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#a01f24]">
                  <Save size={13} /> Simpan
                </button>
              </>
            )}
            <Sep />
            <button onClick={handlePrint} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              <Printer size={13} /> Cetak
            </button>
            <button onClick={handleExportPdf} disabled={exportingPdf} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <FileText size={13} /> {exportingPdf ? '...' : 'PDF'}
            </button>
            <button onClick={handleExportWord} disabled={exportingWord} className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50">
              <FileDown size={13} /> {exportingWord ? '...' : 'Word'}
            </button>
          </div>
        </div>

        {/* Ribbon formatting — hanya muncul saat mode edit aktif */}
        {isEditMode && (
          <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-4 py-1.5">
            <ToolbarBtn onClick={() => execCmd('undo')} title="Undo"><RotateCcw size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('redo')} title="Redo"><RotateCw size={13} /></ToolbarBtn>
            <Sep />
            <select onMouseDown={e => e.stopPropagation()} onChange={e => execCmd('fontSize', e.target.value)}
              className="h-7 rounded border border-gray-200 bg-white px-1.5 text-xs text-gray-700 outline-none focus:border-gray-400" defaultValue="3">
              {[1,2,3,4,5,6,7].map(s => <option key={s} value={s}>{[8,10,12,14,18,24,36][s-1]}pt</option>)}
            </select>
            <Sep />
            <ToolbarBtn onClick={() => execCmd('bold')} active={fmt.bold} title="Bold"><Bold size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('italic')} active={fmt.italic} title="Italic"><Italic size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('underline')} active={fmt.underline} title="Underline"><Underline size={13} /></ToolbarBtn>
            <Sep />
            <ToolbarBtn onClick={() => execCmd('justifyLeft')} active={fmt.align === 'left'} title="Rata Kiri"><AlignLeft size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('justifyCenter')} active={fmt.align === 'center'} title="Rata Tengah"><AlignCenter size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('justifyRight')} active={fmt.align === 'right'} title="Rata Kanan"><AlignRight size={13} /></ToolbarBtn>
            <Sep />
            <span className="text-[11px] text-gray-400">Warna:</span>
            {['#000000','#C0272D','#1d4ed8','#15803d','#92400e','#6b21a8'].map(color => (
              <button key={color} onMouseDown={e => { e.preventDefault(); execCmd('foreColor', color) }} title={color}
                className="h-5 w-5 rounded border border-gray-300 transition hover:scale-110"
                style={{ backgroundColor: color }} />
            ))}
            <label className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-dashed border-gray-400 text-[10px] text-gray-500 hover:border-gray-600" title="Warna lain">
              +<input type="color" className="sr-only" onChange={e => execCmd('foreColor', e.target.value)} />
            </label>
            <Sep />
            <span className="text-[11px] text-gray-400">Sorot:</span>
            {['#FEF08A','#BBF7D0','#BFDBFE','#FECACA'].map(color => (
              <button key={color} onMouseDown={e => { e.preventDefault(); execCmd('hiliteColor', color) }}
                className="h-5 w-5 rounded border border-gray-300 transition hover:scale-110"
                style={{ backgroundColor: color }} />
            ))}
            <span className="ml-auto text-[10px] italic text-gray-400">Klik teks pada laporan untuk mengedit</span>
          </div>
        )}
      </div>

      {/* ══ AREA KERTAS (scroll independen) ══ */}
      <div className={`flex-1 overflow-y-auto py-8 transition-colors duration-300 print:overflow-visible print:py-0 ${isEditMode ? 'bg-slate-400' : 'bg-gray-200'}`}>
        {isEditMode && (
          <p className="mb-3 text-center text-[11px] font-semibold text-white/80 tracking-wide uppercase">
            ✏️ Mode Edit — klik langsung pada teks untuk mengubahnya
          </p>
        )}

        {/* Kertas A4 */}
        <div id="laporan-print-area" className="relative mx-auto bg-white shadow-2xl print:shadow-none"
          style={{ width: '210mm', minHeight: '297mm' }}>

          {/* Garis merah kiri saat edit */}
          {isEditMode && (
            <div className="absolute left-0 top-0 h-full w-[3px] bg-[#C0272D]" />
          )}

          {/* ── KONTEN LAPORAN ── */}
          <div
            ref={editorRef}
            contentEditable={false}
            suppressContentEditableWarning
            onKeyUp={updateToolbarState}
            onMouseUp={updateToolbarState}
            onSelect={updateToolbarState}
            spellCheck={false}
            className="outline-none"
            style={{ padding: '20mm 20mm 20mm 20mm', fontFamily: 'Arial, sans-serif', fontSize: '11pt', lineHeight: 1.5 }}
          >

            {/* HEADER */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <tbody><tr>
                <td style={{ width: '70px', verticalAlign: 'middle' }}>
                  <img src={LOGO_SEKOLAH_URL} alt="Logo Sekolah" style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase' }}>Pemerintah Provinsi Nusa Tenggara Timur</div>
                  <div style={{ fontSize: '11pt' }}>Dinas Pendidikan dan Kebudayaan</div>
                  <div style={{ fontSize: '14pt', fontWeight: 'bold', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Laporan Analisis Kebutuhan Guru</div>
                  <div style={{ fontSize: '10pt', color: '#555' }}>Tahun Ajaran {tahunAjaran}</div>
                </td>
                <td style={{ width: '70px', verticalAlign: 'middle', textAlign: 'right' }}>
                  <img src={LOGO_NTT_URL} alt="Lambang NTT" style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </td>
              </tr></tbody>
            </table>
            <div style={{ borderBottom: '2px solid #1e3a5f', marginBottom: '16px' }} />

            {/* I. IDENTITAS */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '8px', textTransform: 'uppercase' }}>I. Identitas Sekolah</div>
              <table style={{ fontSize: '10.5pt' }}>
                <tbody>
                  {([
                    ['Nama Sekolah', sekolah.nama],
                    ['NPSN', sekolah.npsn],
                    ['Jenis Sekolah', sekolah.jenisSekolah],
                    ['Kabupaten/Kota', sekolah.kabupaten?.nama],
                    ['Alamat', sekolah.alamat ?? '-'],
                    ['Kepala Sekolah', sekolah.kepalaSekolah ?? '_______________'],
                    ['NIP Kepala Sekolah', sekolah.nip ?? '_______________'],
                  ] as [string, string][]).map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ width: '170px', paddingBottom: '3px', color: '#444', verticalAlign: 'top', paddingRight: '8px' }}>{label}</td>
                      <td style={{ paddingBottom: '3px', paddingRight: '10px', color: '#444', verticalAlign: 'top' }}>:</td>
                      <td
                        contentEditable={isEditMode}
                        suppressContentEditableWarning
                        style={{
                          paddingBottom: '3px', fontWeight: '500', minWidth: '200px', verticalAlign: 'top',
                          outline: 'none',
                          borderBottom: isEditMode ? '1px dashed #C0272D' : 'none',
                          backgroundColor: isEditMode ? '#fffbf0' : 'transparent',
                          cursor: isEditMode ? 'text' : 'default',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* II. ROMBEL */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '8px', textTransform: 'uppercase' }}>II. Data Rombongan Belajar</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1d4ed8', color: 'white' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'left' }}>Tingkat</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'center' }}>Jumlah Rombel</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'center' }}>Jumlah Siswa</th>
                  </tr>
                </thead>
                <tbody>
                  {rombel.map((r: any, i: number) => (
                    <tr key={r.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px 10px' }}>Kelas {r.tingkat}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px 10px', textAlign: 'center' }}>{r.jumlahRombel}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px 10px', textAlign: 'center' }}>{r.jumlahSiswa}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#eff6ff', fontWeight: 'bold' }}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '5px 10px' }}>Total</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '5px 10px', textAlign: 'center' }}>{rombel.reduce((s: number, r: any) => s + r.jumlahRombel, 0)}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '5px 10px', textAlign: 'center' }}>{rombel.reduce((s: number, r: any) => s + r.jumlahSiswa, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* III. KEBUTUHAN GURU */}
            {kebutuhan && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '8px', textTransform: 'uppercase' }}>III. Analisis Kebutuhan Guru per Mata Pelajaran</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1d4ed8', color: 'white' }}>
                      {['No','Mata Pelajaran','Rombel','Jam/Mgg','Total Jam','Dibutuhkan','Ada','+/-','Ket.'].map(h => (
                        <th key={h} style={{ border: '1px solid #cbd5e1', padding: '5px 6px', textAlign: 'center' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kebutuhan.detail.map((d: any, idx: number) => {
                      const selisih = d.jumlahGuruAda - d.jumlahGuruDibutuhkan
                      return (
                        <tr key={d.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'center', color: '#94a3b8' }}>{idx+1}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px' }}>{d.mataPelajaran?.nama}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'center' }}>{d.jumlahRombel}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'center' }}>{d.jamPerMinggu}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'center' }}>{d.totalJamDibutuhkan}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', color: '#1d4ed8' }}>{d.jumlahGuruDibutuhkan}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'center' }}>{d.jumlahGuruAda}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', color: selisih<0?'#dc2626':selisih>0?'#d97706':'#16a34a' }}>
                            {selisih > 0 ? `+${selisih}` : selisih}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'center' }}>
                            <span style={{ padding: '1px 6px', borderRadius: '9999px', fontSize: '8.5pt', fontWeight: '500', backgroundColor: selisih<0?'#fee2e2':selisih>0?'#fef3c7':'#dcfce7', color: selisih<0?'#b91c1c':selisih>0?'#92400e':'#15803d' }}>
                              {selisih < 0 ? 'Kurang' : selisih > 0 ? 'Lebih' : 'Cukup'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    <tr style={{ backgroundColor: '#eff6ff', fontWeight: 'bold' }}>
                      <td colSpan={5} style={{ border: '1px solid #cbd5e1', padding: '5px 6px', textAlign: 'right' }}>Total</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px 6px', textAlign: 'center', color: '#1d4ed8' }}>{kebutuhan.totalGuruDibutuhkan}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px 6px', textAlign: 'center' }}>{kebutuhan.totalGuruAda}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px 6px', textAlign: 'center', color: kebutuhan.totalKekurangan>0?'#dc2626':'#16a34a' }}>
                        {kebutuhan.totalGuruAda-kebutuhan.totalGuruDibutuhkan>0?'+':''}{kebutuhan.totalGuruAda-kebutuhan.totalGuruDibutuhkan}
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px 6px' }} />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* IV. DAFTAR GURU */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '8px', textTransform: 'uppercase' }}>IV. Daftar Guru ({guruList.length} orang)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1d4ed8', color: 'white' }}>
                    {['No','Nama Guru','NIP','Status','Mata Pelajaran','Jam/Mgg'].map(h => (
                      <th key={h} style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guruList.map((g: any, idx: number) => (
                    <tr key={g.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px', color: '#94a3b8' }}>{idx+1}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px', fontWeight: '500' }}>{g.nama}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px', fontSize: '8.5pt', color: '#64748b' }}>{g.nip ?? '-'}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px' }}>
                        <span style={{ padding: '1px 8px', borderRadius: '9999px', fontSize: '8.5pt', fontWeight: '500', backgroundColor: g.statusGuru==='PNS'?'#dbeafe':'#f1f5f9', color: g.statusGuru==='PNS'?'#1d4ed8':'#475569' }}>
                          {g.statusGuru}
                        </span>
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px' }}>{g.mataPelajaran?.nama ?? '-'}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px', textAlign: 'center' }}>{g.jumlahJamMengajar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TANDA TANGAN */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
              <div style={{ textAlign: 'center', fontSize: '10.5pt', minWidth: '200px' }}>
                <div
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                  style={{ outline: 'none', borderBottom: isEditMode ? '1px dashed #C0272D' : 'none', backgroundColor: isEditMode ? '#fffbf0' : 'transparent', cursor: isEditMode ? 'text' : 'default' }}
                >
                  {sekolah.kabupaten?.nama ?? 'Kupang'}, {formatTanggal(new Date())}
                </div>
                <div style={{ marginTop: '4px' }}>Kepala Sekolah,</div>
                <div style={{ height: '60px' }} />
                <div
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                  style={{ fontWeight: 'bold', outline: 'none', borderBottom: isEditMode ? '1px dashed #C0272D' : 'none', backgroundColor: isEditMode ? '#fffbf0' : 'transparent', cursor: isEditMode ? 'text' : 'default', minWidth: '150px' }}
                >
                  {sekolah.kepalaSekolah ?? '_______________'}
                </div>
                <div
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                  style={{ color: '#555', fontSize: '9.5pt', marginTop: '2px', outline: 'none', borderBottom: isEditMode ? '1px dashed #C0272D' : 'none', backgroundColor: isEditMode ? '#fffbf0' : 'transparent', cursor: isEditMode ? 'text' : 'default', minWidth: '150px' }}
                >
                  {sekolah.nip ? `NIP. ${sekolah.nip}` : 'NIP. _______________'}
                </div>
              </div>
            </div>

          </div>{/* end konten laporan */}
        </div>{/* end kertas A4 */}
      </div>{/* end area kertas */}

      {/* Print Styles */}
      <style>{`
        @media print {
          * { visibility: hidden !important; }
          #laporan-print-area,
          #laporan-print-area * { visibility: visible !important; }
          #laporan-print-area {
            position: fixed;
            top: 0; left: 0;
            width: 210mm;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}