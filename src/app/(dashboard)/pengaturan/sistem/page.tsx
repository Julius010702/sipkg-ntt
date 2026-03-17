'use client'
// src/app/(dashboard)/pengaturan/sistem/page.tsx
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Alert, Spinner } from '@/components/ui'
import { Save, Settings } from 'lucide-react'

export default function PengaturanSistemPage() {
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/pengaturan-sistem')
      .then(r => r.json())
      .then(j => {
        setSettings(j.data ?? [])
        const v: Record<string, string> = {}
        ;(j.data ?? []).forEach((s: any) => { v[s.kunci] = s.nilai })
        setValues(v)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const updates = settings.map(s => ({ kunci: s.kunci, nilai: values[s.kunci] ?? s.nilai }))
      const res = await fetch('/api/pengaturan-sistem', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan.' })
      } else {
        setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="space-y-5 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-blue-600" />
            <div>
              <h2 className="font-semibold text-gray-900">Pengaturan Sistem</h2>
              <p className="text-xs text-gray-500">Parameter global SIPKG NTT</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {message && <Alert type={message.type} message={message.text} />}

          {settings.map(s => (
            <div key={s.kunci}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{s.label ?? s.kunci}</label>
              <input
                value={values[s.kunci] ?? ''}
                onChange={e => setValues(prev => ({ ...prev, [s.kunci]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {s.deskripsi && <p className="text-xs text-gray-500 mt-1">{s.deskripsi}</p>}
            </div>
          ))}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button onClick={handleSave} loading={saving}>
              <Save size={16} /> Simpan Pengaturan
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
