'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Reservation = {
  id: string
  driver_name: string
  start_date: string
  end_date: string
  vehicles?: { brand: string; model: string; plate: string }
}

export default function CalendarPage() {
  const supabase = createClient()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('reservations')
        .select('*, vehicles(brand, model, plate)')
      if (data) setReservations(data)
    }
    load()
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const dayNames = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()

  const days: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1)
  ]

  const getReservationsForDay = (day: number) => {
    const date = new Date(year, month, day)
    return reservations.filter(r => {
      const start = new Date(r.start_date)
      const end = new Date(r.end_date)
      start.setHours(0,0,0,0)
      end.setHours(23,59,59,999)
      return date >= start && date <= end
    })
  }

  const colors = [
    'rgba(59,91,219,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)',
    'rgba(239,68,68,0.8)', 'rgba(168,85,247,0.8)', 'rgba(236,72,153,0.8)'
  ]

  const vehicleColorMap: Record<string, string> = {}
  reservations.forEach((r, i) => {
    if (!vehicleColorMap[r.vehicle_id || r.id]) {
      vehicleColorMap[r.vehicle_id || r.id] = colors[i % colors.length]
    }
  })

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const selectedReservations = selectedDay ? getReservationsForDay(selectedDay) : []
  const today = new Date()
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Calendario</h1>
        <p className="text-slate-500 mt-1">Reservas del mes</p>
      </div>

      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="font-display text-xl font-semibold text-white">{monthNames[month]} {year}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} />
            const dayReservations = getReservationsForDay(day)
            const isSelected = selectedDay === day
            return (
              <div
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className="relative rounded-xl p-1 cursor-pointer transition-all min-h-16"
                style={{
                  backgroundColor: isSelected ? 'rgba(59,91,219,0.15)' : isToday(day) ? 'rgba(59,91,219,0.08)' : 'transparent',
                  border: isToday(day) ? '1px solid rgba(59,91,219,0.4)' : '1px solid transparent'
                }}
              >
                <p className="text-xs font-medium mb-1 text-center" style={{color: isToday(day) ? '#3b5bdb' : '#94a3b8'}}>{day}</p>
                <div className="space-y-0.5">
                  {dayReservations.slice(0, 2).map(r => (
                    <div key={r.id} className="text-xs px-1 py-0.5 rounded truncate" style={{backgroundColor: vehicleColorMap[r.vehicle_id || r.id] || colors[0], color: 'white', fontSize: '10px'}}>
                      {r.vehicles?.plate || r.driver_name}
                    </div>
                  ))}
                  {dayReservations.length > 2 && (
                    <p className="text-xs text-slate-500 text-center">+{dayReservations.length - 2}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && selectedReservations.length > 0 && (
        <div className="card space-y-3">
          <h3 className="font-display font-semibold text-white">{selectedDay} de {monthNames[month]}</h3>
          {selectedReservations.map(r => (
            <div key={r.id} style={{backgroundColor: '#1e293b', borderRadius: '0.75rem', padding: '1rem'}} className="flex items-center gap-3">
              <div className="w-2 h-10 rounded-full shrink-0" style={{backgroundColor: vehicleColorMap[r.vehicle_id || r.id] || colors[0]}} />
              <div>
                <p className="text-white text-sm font-medium">{r.vehicles?.brand} {r.vehicles?.model} · {r.vehicles?.plate}</p>
                <p className="text-slate-400 text-xs mt-0.5">{r.driver_name} · {new Date(r.start_date).toLocaleDateString('es-ES')} → {new Date(r.end_date).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDay && selectedReservations.length === 0 && (
        <div className="card text-center py-6">
          <p className="text-slate-500 text-sm">No hay reservas el {selectedDay} de {monthNames[month]}</p>
        </div>
      )}
    </div>
  )
}
