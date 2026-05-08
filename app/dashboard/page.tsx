'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({ vehicles: 0, available: 0, reserved: 0, maintenance: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: vehicles } = await supabase.from('vehicles').select('status')
      if (vehicles) {
        setStats({
          vehicles: vehicles.length,
          available: vehicles.filter(v => v.status === 'available').length,
          reserved: vehicles.filter(v => v.status === 'reserved').length,
          maintenance: vehicles.filter(v => v.status === 'maintenance').length,
        })
      }
      const { data: reservations } = await supabase
        .from('reservations')
        .select('*, vehicles(brand, model, plate)')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5)
      if (reservations) setUpcoming(reservations)

      const { data: maint } = await supabase
        .from('maintenance')
        .select('*, vehicles(brand, model, plate)')
        .lte('next_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('next_date', { ascending: true })
        .limit(5)
      if (maint) setAlerts(maint)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total vehículos', value: stats.vehicles, color: 'text-slate-300', bg: 'bg-slate-500/10' },
    { label: 'Disponibles', value: stats.available, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Reservados', value: stats.reserved, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'En mantenimiento', value: stats.maintenance, color: 'text-red-400', bg: 'bg-red-500/10' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen de tu flota</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="card">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
              <span className={`font-display text-xl font-bold ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming reservations */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-white">Próximas reservas</h2>
            <Link href="/reservations" className="text-brand-400 text-sm hover:text-brand-300">Ver todas →</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay reservas próximas</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(r => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-surface-800 last:border-0">
                  <div>
                    <p className="text-slate-200 text-sm font-medium">{r.vehicles?.brand} {r.vehicles?.model}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{r.driver_name} · {new Date(r.start_date).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span className="badge-reserved">Reservado</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-white">Alertas de mantenimiento</h2>
            <Link href="/maintenance" className="text-brand-400 text-sm hover:text-brand-300">Ver todas →</Link>
          </div>
          {alerts.length === 0 ? (
            <p className="text-slate-500 text-sm">Sin alertas esta semana</p>
          ) : (
            <div className="space-y-3">
              {alerts.map(m => (
                <div key={m.id} className="flex items-center justify-between py-3 border-b border-surface-800 last:border-0">
                  <div>
                    <p className="text-slate-200 text-sm font-medium">{m.vehicles?.brand} {m.vehicles?.model}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{m.type} · {new Date(m.next_date).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span className="badge-maintenance">Pendiente</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
