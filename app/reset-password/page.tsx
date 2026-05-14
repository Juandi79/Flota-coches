'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true)
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#090f1a'}}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src="/icon-512.png" alt="Nunsys Flota" className="w-24 h-24 rounded-2xl mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-white">Nueva contraseña</h1>
          <p className="mt-2 text-sm" style={{color: '#64748b'}}>Introduce tu nueva contraseña</p>
        </div>
        <div style={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '1.5rem'}}>
          {success ? (
            <div style={{backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.75rem', padding: '1rem'}}>
              <p style={{color: '#34d399'}} className="text-sm text-center">✅ Contraseña cambiada. Redirigiendo...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="label">Nueva contraseña</label>
                <input type="password" className="input" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              {error && (
                <div style={{backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.75rem'}}>
                  <span style={{color: '#f87171'}} className="text-sm">{error}</span>
                </div>
              )}
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
