'use client'
import { useEffect, useState } from 'react'
import { createClient, getUserRole } from '@/lib/supabase'

type Reservation = {
  id: string
  vehicle_id: string
  user_id: string
  driver_name: string
  start_date: string
  end_date: string
  notes: string
  vehicles?: { brand: string; model: string; plate: string }
}

export default function ReservationsPage() {
  const supabase = createClient()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [form, setForm] = useState({ vehicle_id: '', driver_name: '', start_date: '', end_date: '', notes: '' })

  async function load() {
    const { data } = await supabase
      .from('reservations')
      .select('*, vehicles(brand, model, plate)')
      .order('start_date', { ascending: false })
    if (data) setReservations(data)

    const { data: v } = await supabase.from('vehicles').select('id, brand, model, plate')
    if (v) setVehicles(v)
  }

  useEffect(() => {
    load()
    getUserRole().then(setRole)
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id || null))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (editing) {
      await supabase.from('reservations').update({
        vehicle_id: form.vehicle_id,
        driver_name: form.driver_name,
        start_date: form.start_date,
        end_date: form.end_date,
        notes: form.notes,
      }).eq('id', editing.id)
    } else {
      await supabase.from('reservations').insert({ ...form, user_id: user?.id })
      await supabase.from('vehicles').update({ status: 'reserved' }).eq('id', form.vehicle_id)
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  async function handleDelete(r: Reservation) {
    if (!confirm('¿Cancelar esta reserva?')) return
    await supabase.from('reservations').delete().eq('id', r.id)
    await supabase.from('vehicles').update({ status: 'available' }).eq('id', r.vehicle_id)
    load()
  }

  function openEdit(r: Reservation) {
    setEditing(r)
    setForm({ vehicle_id: r.vehicle_id, driver_name: r.driver_name, start_date: r.start_date, end_date: r.end_date, notes: r.notes })
    setShowForm(true)
  }

  function openNew() {
    setEditing(null)
    setForm({ vehicle_id: '', driver_name: '', start_date: '', end_date: '', notes: '' })
    setShowForm(true)
  }

  const isAdmin = role === 'admin'
  const isPast = (date: string) => new Date(date) < new Date()
  const canEdit = (r: Reservation) => isAdmin || r.user_id === userId

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Reservas</h1>
          <p className="text-slate-500 mt-1">{reservations.length} reserva{reservations.length !== 1 ? 's' : ''} registradas</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva reserva
        </button>
      </div>

      <div className="grid gap-4">
        {reservations.map(r => (
          <div key={r.id} className="card flex items-center justify-between gap-4 overflow-hidden>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)'}}>
                <svg className="w-6 h-6" style={{color: '#f59e0b'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              </div>
              <div>
                <p className="font-medium text-white">{r.vehicles?.brand} {r.vehicles?.model} <span className="text-slate-500 text-sm">· {r.vehicles?.plate}</span></p>
                <p className="text-slate-400 text-sm mt-0.5">
                  {r.driver_name} · {new Date(r.start_date).toLocaleDateString('es-ES')} → {new Date(r.end_date).toLocaleDateString('es-ES')}
                </p>
                {r.notes && <p className="text-slate-500 text-xs mt-1">{r.notes}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={isPast(r.end_date) ? 'badge-available' : 'badge-reserved'}>
                {isPast(r.end_date) ? 'Finalizada' : 'Activa'}
              </span>
              {canEdit(r) && (
                <>
                  <button onClick={() => openEdit(r)} className="text-slate-400 hover:text-white transition-colors p-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(r)} className="text-slate-400 hover:text-red-400 transition-colors p-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {reservations.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-slate-500">No hay reservas aún.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div style={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '1.5rem'}} className="w-full max-w-md">
            <h2 className="font-display text-xl font-semibold text-white mb-6">{editing ? 'Editar reserva' : 'Nueva reserva'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Vehículo</label>
                <select className="input" value={form.vehicle_id} onChange={e => setForm({...form, vehicle_id: e.target.value})} required>
                  <option value="">Seleccionar vehículo</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} · {v.plate}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Conductor</label>
                <input className="input" placeholder="Nombre del conductor" value={form.driver_name} onChange={e => setForm({...form, driver_name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Fecha inicio</label><input className="input" type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required /></div>
                <div><label className="label">Fecha fin</label><input className="input" type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required /></div>
              </div>
              <div>
                <label className="label">Notas (opcional)</label>
                <textarea className="input resize-none" rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">{editing ? 'Guardar' : 'Crear reserva'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
