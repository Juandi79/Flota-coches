'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Vehicle = {
  id: string
  brand: string
  model: string
  plate: string
  itv_date: string
  photo_url: string
  status: string
}

export default function ITVPage() {
  const supabase = createClient()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('vehicles')
        .select('id, brand, model, plate, itv_date, photo_url, status')
        .not('itv_date', 'is', null)
        .order('itv_date', { ascending: true })
      if (data) setVehicles(data)
    }
    load()
  }, [])

  const getDaysLeft = (date: string) => {
    const diff = new Date(date).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getStatus = (date: string) => {
    const days = getDaysLeft(date)
    if (days < 0) return { label: 'Caducada', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
    if (days <= 30) return { label: `${days} días`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }
    if (days <= 90) return { label: `${days} días`, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' }
    return { label: `${days} días`, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' }
  }

  const expired = vehicles.filter(v => getDaysLeft(v.itv_date) < 0)
  const urgent = vehicles.filter(v => getDaysLeft(v.itv_date) >= 0 && getDaysLeft(v.itv_date) <= 30)
  const soon = vehicles.filter(v => getDaysLeft(v.itv_date) > 30 && getDaysLeft(v.itv_date) <= 90)
  const ok = vehicles.filter(v => getDaysLeft(v.itv_date) > 90)

  const Section = ({ title, items, color }: { title: string, items: Vehicle[], color: string }) => (
    items.length > 0 ? (
      <div>
        <h2 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
          <span style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: color, display: 'inline-block'}}></span>
          {title} <span className="text-slate-500 font-normal text-sm">({items.length})</span>
        </h2>
        <div className="grid gap-3">
          {items.map(v => {
            const s = getStatus(v.itv_date)
            return (
              <div key={v.id} className="card flex items-center justify-between gap-4" style={{borderColor: s.border}}>
                <div className="flex items-center gap-4">
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
                    <p className="font-medium text-white">{v.brand} {v.model}</p>
                    <p className="text-slate-400 text-sm mt-0.5">{v.plate} · ITV: {new Date(v.itv_date).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{backgroundColor: s.bg, color: s.color}}>
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    ) : null
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">ITV</h1>
        <p className="text-slate-500 mt-1">Estado de las inspecciones técnicas</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Caducadas', count: expired.length, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Menos de 30 días', count: urgent.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Menos de 90 días', count: soon.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Al día', count: ok.length, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{backgroundColor: s.bg}}>
              <span className="font-display text-xl font-bold" style={{color: s.color}}>{s.count}</span>
            </div>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {vehicles.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500">No hay vehículos con fecha de ITV registrada.</p>
          <p className="text-slate-600 text-sm mt-1">Añade la fecha ITV desde el apartado Vehículos.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <Section title="Caducadas" items={expired} color="#ef4444" />
          <Section title="Vencen en menos de 30 días" items={urgent} color="#f59e0b" />
          <Section title="Vencen en menos de 90 días" items={soon} color="#3b82f6" />
          <Section title="Al día" items={ok} color="#10b981" />
        </div>
      )}
    </div>
  )
}
