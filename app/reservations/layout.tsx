'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
    })
  }, [])

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden" style={{backgroundColor: '#090f1a'}}>
      <Sidebar />
      <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
