'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('Solo puedes registrarte con una cuenta @nunsys.com')
      setLoading(false)
    } else {
      setSuccess('Cuenta creada. Inicia sesión directamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#090f1a'}}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{backgroundColor: 'rgba(59,91,219,0.1)', border: '1px solid rgba(59,91,219,0.2)'}}>
            <svg className="w-8 h-8" style={{color: '#3b5bdb'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">FleetManager Pro</h1>
          <p className="mt-2 text-sm" style={{color: '#64748b'}}>Gestión de flota inteligente</p>
        </div>

        <div className="flex rounded-xl p-1 mb-6" style={{backgroundColor: '#1e293b'}}>
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess('') }}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={mode === 'login' ? {backgroundColor: '#3b5bdb', color: 'white'} : {color: '#94a3b8'}}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccess('') }}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={mode === 'register' ? {backgroundColor: '#3b5bdb', color: 'white'} : {color: '#94a3b8'}}
          >
            Registrarse
          </button>
        </div>

        <div style={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '1.5rem'}}>
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              {mode === 'register' && <p className="text-xs mt-1" style={{color: '#64748b'}}>Mínimo 6 caracteres</p>}
            </div>
            {error && (
              <div style={{backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.75rem'}}>
                <span style={{color: '#f87171'}} className="text-sm">{error}</span>
              </div>
            )}
            {success && (
              <div style={{backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.75rem', padding: '0.75rem'}}>
                <span style={{color: '#34d399'}} className="text-sm">{success}</span>
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
