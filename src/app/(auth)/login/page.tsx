'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const loginCSS = `
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-12px) rotate(1deg); }
  66% { transform: translateY(-6px) rotate(-1deg); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-32px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(196,30,58,0.4); }
  70% { transform: scale(1); box-shadow: 0 0 0 16px rgba(196,30,58,0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(196,30,58,0); }
}
@keyframes particle {
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-120px) translateX(var(--dx)) scale(0); opacity: 0; }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes slide-in {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes badge-in {
  from { opacity: 0; transform: scale(0.8) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.float-logo { animation: float 6s ease-in-out infinite; }
.shimmer-text {
  background: linear-gradient(90deg, #F5C518 0%, #fff 40%, #F5C518 60%, #fff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}
.fade-up { animation: fadeInUp 0.7s ease both; }
.fade-left { animation: fadeInLeft 0.8s ease both; }
.pulse-logo { animation: pulse-ring 2.5s ease-in-out infinite; }
.spin-deco { animation: spin-slow 20s linear infinite; }
.slide-in { animation: slide-in 0.6s ease both; }
.badge-in { animation: badge-in 0.5s ease both; }
.particle {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: particle 3s ease-in infinite;
}
.btn-login {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #C41E3A 0%, #9b1530 100%);
  transition: all 0.3s ease;
}
.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(196,30,58,0.45);
}
.input-field {
  transition: all 0.25s ease;
  border: 1.5px solid #e5e7eb;
  background: #fafafa;
}
.input-field:focus {
  border-color: #C41E3A;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(196,30,58,0.1);
  outline: none;
}
.feature-item { transition: all 0.25s ease; }
.feature-item:hover { transform: translateX(6px); }
.card-login {
  animation: slide-in 0.7s ease both;
  animation-delay: 0.2s;
}
`

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      setError('Email atau password salah. Silakan coba lagi.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  const particles = [
    { top: '20%', left: '15%', color: '#F5C518', delay: '0s', dx: '20px', dur: '3s' },
    { top: '35%', left: '70%', color: '#F5C518', delay: '1s', dx: '-15px', dur: '3.4s' },
    { top: '55%', left: '25%', color: 'rgba(255,255,255,0.5)', delay: '1.5s', dx: '10px', dur: '3.8s' },
    { top: '70%', left: '60%', color: '#F5C518', delay: '0.5s', dx: '-20px', dur: '4.2s' },
    { top: '80%', left: '40%', color: 'rgba(255,255,255,0.4)', delay: '2s', dx: '15px', dur: '3.6s' },
  ]

  return (
    <>
      {mounted && (
        <style dangerouslySetInnerHTML={{ __html: loginCSS }} />
      )}

      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>

        {/* ══ Panel Kiri — Branding ══ */}
        <div
          className="hidden lg:flex flex-col justify-between"
          style={{
            width: '48%',
            padding: '48px',
            background: 'linear-gradient(160deg, #8B0000 0%, #C41E3A 35%, #9b1530 65%, #6b0f23 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Dekorasi lingkaran */}
          <div style={{
            position: 'absolute', top: '-120px', right: '-120px',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'rgba(245,197,24,0.08)',
            border: '1px solid rgba(245,197,24,0.12)',
          }} className="spin-deco" />
          <div style={{
            position: 'absolute', bottom: '-80px', left: '-80px',
            width: '280px', height: '280px', borderRadius: '50%',
            background: 'rgba(245,197,24,0.06)',
            border: '1px solid rgba(245,197,24,0.1)',
          }} />
          <div style={{
            position: 'absolute', top: '40%', left: '-40px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }} />

          {/* Partikel — hanya render di client */}
          {mounted && particles.map((p, i) => (
            <div key={i} className="particle" style={{
              top: p.top, left: p.left,
              background: p.color,
              animationDelay: p.delay,
              animationDuration: p.dur,
              ['--dx' as any]: p.dx,
            }} />
          ))}

          {/* Logo + nama */}
          <div className="fade-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <div className="pulse-logo" style={{
              width: '60px', height: '60px',
              background: 'white', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              <img src="/logo-ntt.png" alt="Logo NTT" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '18px', lineHeight: '1.2' }}>SIPKG NTT</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px' }}>Pemerintah Provinsi NTT</p>
            </div>
          </div>

          {/* Tengah */}
          <div style={{ position: 'relative' }}>
            <div className="float-logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '160px', height: '160px',
                background: 'rgba(255,255,255,0.1)', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(245,197,24,0.3)',
              }}>
                <img src="/logo-ntt.png" alt="Logo NTT" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
              </div>
            </div>

            <div className="fade-up" style={{ animationDelay: '0.1s', marginBottom: '12px' }}>
              <span className="shimmer-text" style={{ fontSize: '36px', fontWeight: 800, lineHeight: '1.2', display: 'block' }}>
                Sistem Informasi
              </span>
              <span style={{ color: 'white', fontSize: '36px', fontWeight: 800, lineHeight: '1.2', display: 'block' }}>
                Perhitungan
              </span>
              <span style={{ color: '#F5C518', fontSize: '36px', fontWeight: 800, lineHeight: '1.2', display: 'block' }}>
                Kebutuhan Guru
              </span>
            </div>

            <p className="fade-up" style={{
              color: 'rgba(255,255,255,0.7)', fontSize: '13px',
              lineHeight: '1.7', maxWidth: '340px',
              animationDelay: '0.2s', marginBottom: '32px',
            }}>
              Platform digital terpadu perencanaan tenaga pendidik SMA, SMK, dan SLB
              di Provinsi Nusa Tenggara Timur.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: '📊', label: 'Perhitungan otomatis kebutuhan guru', delay: '0.3s' },
                { icon: '🏫', label: 'Monitoring 22 kabupaten/kota se-NTT', delay: '0.4s' },
                { icon: '📄', label: 'Laporan cetak & ekspor Excel', delay: '0.5s' },
              ].map((f) => (
                <div key={f.label} className="feature-item fade-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', animationDelay: f.delay }}>
                  <div style={{
                    width: '36px', height: '36px',
                    background: 'rgba(245,197,24,0.15)',
                    border: '1px solid rgba(245,197,24,0.3)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}>
                    {f.icon}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>{f.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer kiri */}
          <div className="fade-up" style={{ animationDelay: '0.6s', position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 16px',
              background: 'rgba(0,0,0,0.2)', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
                © {new Date().getFullYear()} Biro Organisasi Setda Provinsi NTT
              </p>
            </div>
          </div>
        </div>

        {/* ══ Panel Kanan — Form ══ */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px', background: '#f8f5f5',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(196,30,58,0.05)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', left: '-40px',
            width: '150px', height: '150px', borderRadius: '50%',
            background: 'rgba(245,197,24,0.06)',
          }} />

          {/* Logo mobile */}
          <div className="lg:hidden fade-up" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginBottom: '28px', animationDelay: '0.1s',
          }}>
            <div style={{
              width: '80px', height: '80px', background: 'white',
              borderRadius: '20px', boxShadow: '0 8px 24px rgba(196,30,58,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', marginBottom: '12px',
            }}>
              <img src="/logo-ntt.png" alt="Logo NTT" style={{ width: '68px', height: '68px', objectFit: 'contain' }} />
            </div>
            <p style={{ fontWeight: 800, fontSize: '20px', color: '#1a1a1a' }}>SIPKG NTT</p>
            <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
              Sistem Informasi Perhitungan Kebutuhan Guru
            </p>
          </div>

          {/* Card */}
          <div className="card-login" style={{
            width: '100%', maxWidth: '420px',
            background: 'white', borderRadius: '24px',
            padding: '40px 36px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(196,30,58,0.06)',
            border: '1px solid rgba(196,30,58,0.08)',
            position: 'relative',
          }}>
            {/* Garis aksen atas */}
            <div style={{
              position: 'absolute', top: 0, left: '36px', right: '36px',
              height: '3px',
              background: 'linear-gradient(90deg, #C41E3A, #F5C518, #C41E3A)',
              borderRadius: '0 0 4px 4px',
            }} />

            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', marginBottom: '6px' }}>
                Selamat Datang
              </h2>
              <p style={{ fontSize: '13px', color: '#888' }}>
                Masuk dengan akun yang diberikan Admin Pusat
              </p>
            </div>

            {error && (
              <div style={{
                marginBottom: '16px',
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                background: '#fff5f5', border: '1px solid #fecaca',
                color: '#b91c1c', padding: '12px 14px',
                borderRadius: '12px', fontSize: '13px',
              }}>
                <span style={{ flexShrink: 0, marginTop: '1px' }}>⚠</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@nttprov.go.id"
                  required
                  autoComplete="email"
                  className="input-field"
                  style={{
                    width: '100%', padding: '12px 14px',
                    borderRadius: '12px', fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="input-field"
                    style={{
                      width: '100%', padding: '12px 90px 12px 14px',
                      borderRadius: '12px', fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '11px', fontWeight: 600, color: '#C41E3A', padding: '4px',
                    }}
                  >
                    {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-login"
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: '12px', border: 'none',
                  fontSize: '14px', fontWeight: 700,
                  color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '4px', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: '16px', height: '16px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: 'white', borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin-slow 0.7s linear infinite',
                    }} />
                    Memproses...
                  </>
                ) : (
                  <>Masuk ke Sistem &rarr;</>
                )}
              </button>
            </form>

            <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { label: 'Admin Pusat', color: '#C41E3A' },
                { label: 'Admin Sekolah', color: '#854F0B' },
              ].map((b) => (
                <span key={b.label} className="badge-in" style={{
                  padding: '4px 12px', borderRadius: '999px',
                  background: `${b.color}12`,
                  border: `1px solid ${b.color}30`,
                  color: b.color, fontSize: '11px', fontWeight: 600,
                }}>
                  {b.label}
                </span>
              ))}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#aaa' }}>
                Lupa password? Hubungi Admin Pusat
              </p>
            </div>
          </div>

          <p style={{ marginTop: '20px', fontSize: '11px', color: '#bbb', position: 'relative' }}>
            SIPKG NTT v1.0 &middot; Pemprov NTT {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  )
}