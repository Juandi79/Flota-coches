'use client'
import { useEffect, useState } from 'react'
import { createClient, getUserRole } from '@/lib/supabase'

type Vehicle = {
  id: string
  brand: string
  model: string
  plate: string
  year: number
  status: 'available' | 'reserved' | 'maintenance'
  chassis_number: string
  insurance_company: string
  insurance_policy: string
  itv_date: string
  photo_url: string
  ownership: string
}

type Maintenance = {
  id: string
  type: string
  date: string
  next_date: string
  cost: number
  notes: string
}

const statusLabel = { available: 'Disponible', reserved: 'Reservado', maintenance: 'Mantenimiento' }

export default function VehiclesPage() {
  const supabase = createClient()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Vehicle | null>(null)
  const [repairs, setRepairs] = useState<Maintenance[]>([])
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    brand: '', model: '', plate: '', year: '', status: 'available',
    chassis_number: '', insurance_company: '', insurance_policy: '', itv_date: '', photo_url: '', ownership: 'propio'
  })

  async function loadVehicles() {
    const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (data) setVehicles(data)
  }

  async function loadRepairs(vehicleId: string) {
    const { data } = await supabase.from('maintenance').select('*').eq('vehicle_id', vehicleId).order('date', { ascending: false })
    if (data) setRepairs(data)
  }

  useEffect(() => {
    loadVehicles()
    getUserRole().then(setRole)
  }, [])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('vehicle-photos').upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName)
      setForm(f => ({ ...f, photo_url: data.publicUrl }))
    }
    setUploading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ brand: '', model: '', plate: '', year: '', status: 'available', chassis_number: '', insurance_company: '', insurance_policy: '', itv_date: '', photo_url: '', ownership: 'propio'})
    setShowForm(true)
  }

  function openEdit(v: Vehicle) {
    setEditing(v)
    setForm({
      brand: v.brand, model: v.model, plate: v.plate, year: String(v.year), status: v.status,
      chassis_number: v.chassis_number || '', insurance_company: v.insurance_company || '',
      insurance_policy: v.insurance_policy || '', itv_date: v.itv_date || '', photo_url: v.photo_url || '', ownership: v.ownership || 'propio'
    })
    setShowForm(true)
  }

  async function openDetail(v: Vehicle) {
    setSelected(v)
    await loadRepairs(v.id)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form, year: Number(form.year) }
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

  const isAdmin = role === 'admin'

  const itvUrgent = (date: string) => {
    if (!date) return false
    const diff = new Date(date).getTime() - Date.now()
    return diff < 30 * 24 * 60 * 60 * 1000
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Vehículos</h1>
          <p className="text-slate-500 mt-1">{vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} en la flota</p>
        </div>
        {isAdmin && (
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Añadir
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {vehicles.map(v => (
          <div key={v.id} className="card cursor-pointer hover:border-slate-600 transition-all overflow-hidden" onClick={() => openDetail(v)}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{border: '1px solid #1e293b'}}>
                {v.photo_url ? (
                  <img src={v.photo_url} alt={v.model} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{backgroundColor: 'rgba(59,91,219,0.1)'}}>
                    <svg className="w-6 h-6" style={{color: '#3b5bdb'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-white">{v.brand} {v.model} <span className="text-slate-500 font-normal">({v.year})</span></p>
                <p className="text-slate-400 text-sm mt-0.5">{v.plate}{v.itv_date && <> · ITV: <span style={itvUrgent(v.itv_date) ? {color: '#f59e0b'} : {}}>{new Date(v.itv_date).toLocaleDateString('es-ES')}</span></>}</p>
              </div>
            </div>
            </div>
            <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
              <span className={v.status === 'available' ? 'badge-available' : v.status === 'reserved' ? 'badge-reserved' : 'badge-maintenance'}>
                {statusLabel[v.status]}
              </span>
              {isAdmin && (
                <>
                  <button onClick={() => openEdit(v)} className="text-slate-400 hover:text-white transition-colors p-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(v.id)} className="text-slate-400 hover:text-red-400 transition-colors p-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {vehicles.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-slate-500">No hay vehículos aún.</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div style={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem'}} className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {selected.photo_url && (
              <img src={selected.photo_url} alt={selected.model} className="w-full h-48 object-cover rounded-t-2xl" />
            )}
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">{selected.brand} {selected.model}</h2>
                  <p className="text-slate-400 mt-1">{selected.plate} · {selected.year}</p>
                </div>
                <span className={selected.status === 'available' ? 'badge-available' : selected.status === 'reserved' ? 'badge-reserved' : 'badge-maintenance'}>
                  {statusLabel[selected.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selected.ownership && (
                  <div style={{backgroundColor: '#1e293b', borderRadius: '0.75rem', padding: '1rem'}}>
                    <p className="text-slate-500 text-xs mb-1">Propiedad</p>
                    <p className="text-white text-sm font-medium capitalize">{selected.ownership}</p>
                  </div>
                )}
                {selected.chassis_number && (
                  <div style={{backgroundColor: '#1e293b', borderRadius: '0.75rem', padding: '1rem'}}>
                    <p className="text-slate-500 text-xs mb-1">Nº Bastidor</p>
                    <p className="text-white text-sm font-medium">{selected.chassis_number}</p>
                  </div>
                )}
                {selected.insurance_company && (
                  <div style={{backgroundColor: '#1e293b', borderRadius: '0.75rem', padding: '1rem'}}>
                    <p className="text-slate-500 text-xs mb-1">Seguro</p>
                    <p className="text-white text-sm font-medium">{selected.insurance_company}</p>
                    {selected.insurance_policy && <p className="text-slate-400 text-xs mt-0.5">Póliza: {selected.insurance_policy}</p>}
                  </div>
                )}
                {selected.itv_date && (
                  <div style={{backgroundColor: itvUrgent(selected.itv_date) ? 'rgba(245,158,11,0.1)' : '#1e293b', border: itvUrgent(selected.itv_date) ? '1px solid rgba(245,158,11,0.3)' : 'none', borderRadius: '0.75rem', padding: '1rem'}}>
                    <p className="text-slate-500 text-xs mb-1">ITV</p>
                    <p className="text-sm font-medium" style={{color: itvUrgent(selected.itv_date) ? '#f59e0b' : 'white'}}>
                      {new Date(selected.itv_date).toLocaleDateString('es-ES')}
                      {itvUrgent(selected.itv_date) && <span className="text-xs ml-2">⚠️ Próxima</span>}
                    </p>
                  </div>
                )}
              </div>

              {/* Repairs */}
              <div>
                <h3 className="font-display font-semibold text-white mb-3">Reparaciones</h3>
                {repairs.length === 0 ? (
                  <p className="text-slate-500 text-sm">Sin reparaciones registradas</p>
                ) : (
                  <div className="space-y-2">
                    {repairs.map(r => (
                      <div key={r.id} style={{backgroundColor: '#1e293b', borderRadius: '0.75rem', padding: '0.75rem'}} className="flex justify-between items-start">
                        <div>
                          <p className="text-white text-sm font-medium">{r.type}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{new Date(r.date).toLocaleDateString('es-ES')}</p>
                          {r.notes && <p className="text-slate-500 text-xs mt-0.5">{r.notes}</p>}
                        </div>
                        {r.cost > 0 && <p className="text-slate-300 text-sm">{r.cost}€</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setSelected(null)} className="btn-secondary w-full">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div style={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '1.5rem'}} className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl font-semibold text-white mb-6">{editing ? 'Editar vehículo' : 'Nuevo vehículo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Foto */}
              <div>
                <label className="label">Foto del vehículo</label>
                {form.photo_url && <img src={form.photo_url} className="w-full h-32 object-cover rounded-xl mb-2" />}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-slate-400 text-sm w-full" />
                {uploading && <p className="text-slate-500 text-xs mt-1">Subiendo...</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Marca</label><input className="input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} required /></div>
                <div><label className="label">Modelo</label><input className="input" value={form.model} onChange={e => setForm({...form, model: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Matrícula</label><input className="input" value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} required /></div>
                <div><label className="label">Año</label><input className="input" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} required /></div>
              </div>
              <div><label className="label">Nº Bastidor</label><input className="input" value={form.chassis_number} onChange={e => setForm({...form, chassis_number: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Compañía seguro</label><input className="input" value={form.insurance_company} onChange={e => setForm({...form, insurance_company: e.target.value})} /></div>
                <div><label className="label">Nº Póliza</label><input className="input" value={form.insurance_policy} onChange={e => setForm({...form, insurance_policy: e.target.value})} /></div>
              </div>
              <div><label className="label">Fecha ITV</label><input className="input" type="date" value={form.itv_date} onChange={e => setForm({...form, itv_date: e.target.value})} /></div>
              <div>
                <label className="label">Propiedad</label>
                <input className="input" placeholder="Ej: Propio, Renting (Alphabet)..." value={form.ownership} onChange={e => setForm({...form, ownership: e.target.value})} />
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
                <button type="submit" className="btn-primary flex-1" disabled={uploading}>{editing ? 'Guardar' : 'Añadir'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
