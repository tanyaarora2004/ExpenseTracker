import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-ink flex">
      {/* Background orbs */}
      <div className="glow-orb w-96 h-96 bg-jade/8 top-[-10%] left-[-5%]" />
      <div className="glow-orb w-80 h-80 bg-sky-pxt/6 bottom-[-5%] right-[-5%]" />

      <Sidebar />

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A2E',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00D68F', secondary: '#0D0D14' } },
          error: { iconTheme: { primary: '#FF6B6B', secondary: '#0D0D14' } },
        }}
      />
    </div>
  )
}
