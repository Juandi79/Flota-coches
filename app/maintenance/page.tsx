'use client'
import { useEffect, useState } from 'react'
import { createClient, getUserRole } from '@/lib/supabase'

type Maintenance = {
  id: string
  vehicle_id: string
  type: string
  date: string
  next_date: string
  cost: number
  notes: string
  vehicles?: { brand: string; model: string; plate: string; photo_url: string }
}

type Vehicle = {
  id: string
  brand: string
  model: string
  plate: string
  photo_url: string
}

export default function MaintenancePage() {
  const supabase = createClient()
  const [records, setRecords] = useState<Maintenance[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Maintenance | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [form, setForm] = useState({ vehicle_id: '', type: '', date: '', next_date: '', cost: '', notes: '' })

  async function load() {
    const { data } = await supabase
      .from('maintenance')
      .select('*, vehicles(brand, model, plate, photo_url)')
      .order('date', { ascending: false })
    if (data) setRecords(data)

    const { data: v } = await supabase.from('vehicles').select('id, brand, model, plate, photo_url')
    if (v) setVehicles(v)
  }

  useEffect(() => {
    load()
    getUserRole().then(setRole)
  }, [])

  function openNew() {
    setEditing(null)
    setForm({ vehicle_id: '', type: '', date: '', next_date: '', cost: '', notes: '' })
    setShowForm(true)
  }

  function openEdit(m: Maintenance) {
    setEditing(m)
    setForm({
      vehicle_id: m.vehicle_id,
      type: m.type,
      date: m.date,
      next_date: m.next_date || '',
      cost: String(m.cost || ''),
      notes: m.notes || ''
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: any = {
      vehicle_id: form.vehicle_id,
      type: form.type,
      date: form.date,
      cost: Number(form.cost) || 0,
      notes: form.notes,
    }
    if (form.next_date) payload.next_date = form.next_date

    if (editing) {
      const { error } = await supabase.from('maintenance').update(payload).eq('id', editing.id)
      if (error) { alert('Error al guardar: ' + error.message); return }
    } else {
      const { error } = await supabase.from('maintenance').insert(payload)
      if (error) { alert('Error al añadir: ' + error.message); return }
    }
    setShowForm(false)
    setEditing(null)
    setForm({ vehicle_id: '', type: '', date: '', next_date: '', cost: '', notes: '' })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este registro?')) return
    await supabase.from('maintenance').delete().eq('id', id)
    load()
  }

  const isAdmin = role === 'admin'
  const isUrgent = (date: string) => {
    const diff = new Date(date).getTime() - Date.now()
    return diff < 7 * 24 * 60 * 60 * 1000
  }

  const filteredRecords = selectedVehicle
    ? records.filter(r => r.vehicle_id === selectedVehicle)
    : records

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Mantenimiento</h1>
          <p className="text-slate-500 mt-1">
            {selectedVehicle ? `${selectedVehicleData?.brand} ${selectedVehicleData?.model}` : 'Todos los vehículos'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Registrar
          </button>
        )}
      </div>

      {/* Filtro por vehículo */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedVehicle(null)}
          className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={!selectedVehicle ? {backgroundColor: '#3b5bdb', color: 'white'} : {backgroundColor: '#1e293b', color: '#94a3b8'}}
        >
          Todos
        </button>
        {vehicles.map(v => (
          <button
            key={v.id}
            onClick={() => setSelectedVehicle(v.id)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={selectedVehicle === v.id ? {backgroundColor: '#3b5bdb', color: 'white'} : {backgroundColor: '#1e293b', color: '#94a3b8'}}
          >
            {v.photo_url && <img src={v.photo_url} className="w-5 h-5 rounded object-cover" />}
            {v.brand} {v.model} · {v.plate}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="grid gap-4">
        {filteredRecords.map(m => (
          <div
            key={m.id}
            className="card flex items-center justify-between gap-4 overflow-hidden"
            style={m.next_date && isUrgent(m.next_date) ? {borderColor: 'rgba(245,158,11,0.3)'} : {}}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)'}}>
                <svg className="w-6 h-6" style={{color: '#ef4444'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-white truncate">{m.vehicles?.brand} {m.vehicles?.model} <span className="text-slate-500 text-sm">· {m.vehicles?.plate}</span></p>
                <p className="text-slate-400 text-sm mt-0.5 truncate">
                  {m.type} · {new Date(m.date).toLocaleDateString('es-ES')}
                  {m.next_date && <> · Próximo: <span style={isUrgent(m.next_date) ? {color: '#f59e0b'} : {}}>{new Date(m.next_date).toLocaleDateString('es-ES')}</span></>}
                </p>
                {m.cost > 0 && <p className="text-slate-500 text-xs mt-1">{m.cost.toLocaleString()}€</p>}
                {m.notes && <p className="text-slate-500 text-xs mt-0.5 truncate">{m.notes}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {m.next_date && isUrgent(m.next_date) && (
                <span className="badge-maintenance">Urgente</span>
              )}
              {isAdmin && (
                <>
                  <button onClick={() => openEdit(m)} className="text-slate-400 hover:text-white transition-colors p-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="text-slate-400 hover:text-red-400 transition-colors p-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {filteredRecords.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-slate-500">No hay registros de mantenimiento.</p>
          </div>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div style={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '1.5rem'}} className="w-full max-w-md">
            <h2 className="font-display text-xl font-semibold text-white mb-6">{editing ? 'Editar mantenimiento' : 'Registrar mantenimiento'}</h2>
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
                <label className="label">Tipo de mantenimiento</label>
                <input className="input" placeholder="Ej: Cambio de aceite, ITV..." value={form.type} onChange={e => setForm({...form, type: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Fecha realizado</label><input className="input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                <div><label className="label">Próximo (opcional)</label><input className="input" type="date" value={form.next_date} onChange={e => setForm({...form, next_date: e.target.value})} /></div>
              </div>
              <div>
                <label className="label">Coste (€)</label>
                <input className="input" type="number" placeholder="0" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
              </div>
              <div>
                <label className="label">Notas (opcional)</label>
                <textarea className="input resize-none" rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">{editing ? 'Guardar cambios' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
