'use client'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardBody, Button, Alert } from '@/components/ui'
import { User, Lock, Save, Camera, Trash2, Upload, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'

export default function ProfilPage() {
  const { data: session, update } = useSession()
  const [tab, setTab] = useState<'profil' | 'password'>('profil')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const user = session?.user as any
  const role = user?.role
  const namaSekolah = user?.namaSekolah

  const profilForm = useForm<{ nama: string }>({ defaultValues: { nama: '' } })
  const passwordForm = useForm<{
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }>()

  // Isi form setelah session loaded
  useEffect(() => {
    if (user?.name) {
      profilForm.reset({ nama: user.name })
    }
  }, [user?.name])

  // Ambil avatar terbaru dari server
  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/users/${user.id}/profil`)
      .then(r => r.json())
      .then(j => { if (j.data?.avatar) setAvatarUrl(j.data.avatar) })
      .catch(() => {})
  }, [user?.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran file terlalu besar. Maksimal 2MB.' })
      return
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP.' })
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)
    setMessage(null)
  }

  const handleUploadAvatar = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage(null)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch('/api/upload/avatar', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: json.error ?? 'Gagal mengupload foto' })
        return
      }
      setAvatarUrl(json.avatar + '?t=' + Date.now())
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' })
      await update({ avatar: json.avatar })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!confirm('Yakin ingin menghapus foto profil?')) return
    setUploading(true)
    try {
      const res = await fetch('/api/upload/avatar', { method: 'DELETE' })
      if (res.ok) {
        setAvatarUrl(null)
        setPreviewUrl(null)
        setMessage({ type: 'success', text: 'Foto profil berhasil dihapus.' })
        await update({ avatar: null })
      }
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfil = async (data: { nama: string }) => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/users/${user?.id}/profil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: data.nama.trim() }),
      })
      const json = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' })
        await update({ name: data.nama.trim() })
      } else {
        setMessage({ type: 'error', text: json.error ?? 'Gagal memperbarui profil.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    if (data.newPassword !== data.confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/users/${user?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password berhasil diubah.' })
        passwordForm.reset()
      } else {
        setMessage({ type: 'error', text: json.error ?? 'Gagal mengubah password.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const displayImage = previewUrl || avatarUrl
  const initials = user?.name?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="max-w-xl space-y-5">

      {/* Kartu Foto Profil */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-blue-100 flex items-center justify-center">
                {displayImage ? (
                  <img src={displayImage} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-blue-600 font-bold text-4xl">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                title="Ganti foto"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-blue-600 mt-0.5">
                {role === 'ADMIN_PUSAT'
                  ? '🏛️ Admin Pusat'
                  : `🏫 Admin Sekolah${namaSekolah ? ` — ${namaSekolah}` : ''}`}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} />
                  Pilih Foto
                </Button>
                {previewUrl && (
                  <Button size="sm" onClick={handleUploadAvatar} loading={uploading}>
                    <CheckCircle size={14} />
                    Simpan Foto
                  </Button>
                )}
                {avatarUrl && !previewUrl && (
                  <Button size="sm" variant="danger" onClick={handleDeleteAvatar} loading={uploading}>
                    <Trash2 size={14} />
                    Hapus Foto
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP · Maks. 2MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </CardBody>
      </Card>

      {/* Tab Navigasi */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setTab('profil'); setMessage(null) }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'profil' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User size={14} className="inline mr-1.5" />
          Profil
        </button>
        <button
          onClick={() => { setTab('password'); setMessage(null) }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lock size={14} className="inline mr-1.5" />
          Ganti Password
        </button>
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      {/* Form Edit Profil */}
      {tab === 'profil' && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-900">Informasi Akun</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={profilForm.handleSubmit(handleSaveProfil)} className="space-y-4">

              {/* Nama — pakai input biasa agar register() bekerja dengan benar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Nama Anda"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    profilForm.formState.errors.nama
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  {...profilForm.register('nama', {
                    required: 'Nama tidak boleh kosong',
                    minLength: { value: 3, message: 'Nama minimal 3 karakter' },
                  })}
                />
                {profilForm.formState.errors.nama && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    ⚠ {profilForm.formState.errors.nama.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  value={user?.email ?? ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  value={role === 'ADMIN_PUSAT' ? 'Admin Pusat' : 'Admin Sekolah'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {namaSekolah && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sekolah</label>
                  <input
                    value={namaSekolah}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button type="submit" loading={saving}>
                  <Save size={16} />
                  Simpan Profil
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Form Ganti Password */}
      {tab === 'password' && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-900">Ganti Password</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordForm.formState.errors.currentPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  {...passwordForm.register('currentPassword', { required: 'Wajib diisi' })}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">⚠ {passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input
                  type="password"
                  placeholder="Min. 6 karakter"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordForm.formState.errors.newPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  {...passwordForm.register('newPassword', {
                    required: 'Wajib diisi',
                    minLength: { value: 6, message: 'Minimal 6 karakter' },
                  })}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">⚠ {passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  placeholder="Ulangi password baru"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordForm.formState.errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  {...passwordForm.register('confirmPassword', { required: 'Wajib diisi' })}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">⚠ {passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button type="submit" loading={saving}>
                  <Lock size={16} />
                  Ubah Password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  )
}