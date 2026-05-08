'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Vehicle = {
  id: string
  brand: string
  model: string
  plate: string
  year: number
  status: 'available' | 'reserved' | 'maintenance'
  color: string
  km: number
}

const statusLabel = { available: 'Disponible', reserved: 'Reservado', maintenance: 'Mantenimiento' }

export default function VehiclesPage() {
  const supabase = createClient()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [form, setForm] = useState({ brand: '', model: '', plate: '', year: '', color: '', km: '', status: 'available' })

  async function loadVehicles() {
    const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (data) setVehicles(data)
  }

  useEffect(() => { loadVehicles() }, [])

  function openNew() {
    setEditing(null)
    setForm({ brand: '', model: '', plate: '', year: '', color: '', km: '', status: 'available' })
    setShowForm(true)
  }

  function openEdit(v: Vehicle) {
    setEditing(v)
    setForm({ brand: v.brand, model: v.model, plate: v.plate, year: String(v.year), color: v.color, km: String(v.km), status: v.status })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form, year: Number(form.year), km: Number(form.km) }
    if (editing) {
      await supabase.from('vehicles').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('vehicles').insert(payload)
    }
    setShowForm(false)
    loadVehicles()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este vehículo?')) return
    await supabase.from('vehicles').delete().eq('id', id)
    loadVehicles()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Vehículos</h1>
          <p className="text-slate-500 mt-1">{vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} en la flota</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Añadir
        </button>
      </div>

      {/* Vehicle list */}
      <div className="grid gap-4">
        {vehicles.map(v => (
          <div key={v.id} className="card flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20 shrink-0">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
              </div>
              <div>
                <p className="font-medium text-white">{v.brand} {v.model} <span className="text-slate-500 font-normal">({v.year})</span></p>
                <p className="text-slate-400 text-sm mt-0.5">{v.plate} · {v.color} · {v.km?.toLocaleString()} km</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={v.status === 'available' ? 'badge-available' : v.status === 'reserved' ? 'badge-reserved' : 'badge-maintenance'}>
                {statusLabel[v.status]}
              </span>
              <button onClick={() => openEdit(v)} className="text-slate-400 hover:text-white transition-colors p-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button onClick={() => handleDelete(v.id)} className="text-slate-400 hover:text-red-400 transition-colors p-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
        {vehicles.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-slate-500">No hay vehículos aún. Añade el primero.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-display text-xl font-semibold text-white mb-6">{editing ? 'Editar vehículo' : 'Nuevo vehículo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Marca</label><input className="input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} required /></div>
                <div><label className="label">Modelo</label><input className="input" value={form.model} onChange={e => setForm({...form, model: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Matrícula</label><input className="input" value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} required /></div>
                <div><label className="label">Año</label><input className="input" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Color</label><input className="input" value={form.color} onChange={e => setForm({...form, color: e.target.value})} /></div>
                <div><label className="label">Kilómetros</label><input className="input" type="number" value={form.km} onChange={e => setForm({...form, km: e.target.value})} /></div>
              </div>
              <div>
                <label className="label">Estado</label>
                <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="available">Disponible</option>
                  <option value="reserved">Reservado</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">{editing ? 'Guardar' : 'Añadir'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
