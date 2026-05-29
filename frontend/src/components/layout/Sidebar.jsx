import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Receipt, Target, PiggyBank,
  LogOut, Wallet
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/budgets', icon: Wallet, label: 'Budgets' },
  { to: '/goals', icon: Target, label: 'Goals' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40"
      style={{ background: 'rgba(13,13,20,0.98)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="px-6 py-7 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-jade flex items-center justify-center shadow-glow-jade">
            <PiggyBank className="w-5 h-5 text-ink" />
          </div>
          <div>
            <span className="font-display font-bold text-xl text-white tracking-tight">PxT</span>
            <p className="text-white/30 text-xs font-body -mt-0.5">Expense Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all duration-200 ${
                isActive
                  ? 'text-jade bg-jade-glow border border-jade/20 font-medium'
                  : 'text-white/45 hover:text-white/80 hover:bg-glass'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-jade' : ''}`} size={18} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-6 space-y-2 border-t border-border pt-4">
        {/* User pill */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card">
          <div className="w-8 h-8 rounded-lg bg-jade/20 border border-jade/30 flex items-center justify-center">
            <span className="font-display font-bold text-jade text-sm">
              {user?.name?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-body font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-white/35 text-xs truncate">{user?.email || ''}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/40
                     hover:text-coral hover:bg-coral/5 transition-all duration-200 text-sm font-body"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
