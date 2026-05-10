import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{backgroundColor: '#090f1a'}}>
      <Sidebar />
      <main className="flex-1 p-6 pb-24 md:pb-6 max-w-5xl">
        {children}
      </main>
    </div>
  )
}
