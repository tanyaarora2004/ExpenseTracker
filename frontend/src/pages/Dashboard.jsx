import { useState, useEffect, useMemo, useRef } from 'react'
import { AlertCircle, CheckCircle2, Plus, Loader2, Trash2, X } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { formatCurrency, getCategoryById, getSpentByCategory, getMonthlyData, CATEGORIES } from '../utils/data'
import StatCard from '../components/ui/StatCard'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px' }}>
        <p className="font-mono text-jade text-sm">{formatCurrency(payload[0].value)}</p>
        <p className="text-white/50 text-xs mt-0.5">{payload[0].payload.month}</p>
      </div>
    )
  }
  return null
}

const EMPTY_FORM = { title: '', category: 'food', amount: '', date: new Date(), note: '' }

export default function Dashboard() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const alertRef = useRef(null)

  // Close alert dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (alertRef.current && !alertRef.current.contains(e.target)) setShowAlerts(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [expRes, budRes, goalRes] = await Promise.all([
          api.get('/expenses'),
          api.get('/budgets'),
          api.get('/goals'),
        ])
        setExpenses(expRes.data)
        setBudgets(budRes.data)
        setGoals(goalRes.data)
      } catch {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])
  const totalBudget = useMemo(() => budgets.reduce((s, b) => s + b.limit, 0), [budgets])
  const spentByCategory = useMemo(() => getSpentByCategory(expenses), [expenses])
  const monthlyData = useMemo(() => getMonthlyData(expenses), [expenses])

  const alerts = budgets.filter(b => {
    const spent = spentByCategory[b.category] || 0
    return b.limit > 0 && spent / b.limit >= 0.8
  })

  const recent = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const pieData = CATEGORIES.map(cat => ({
    name: cat.label, value: spentByCategory[cat.id] || 0, color: cat.color,
  })).filter(d => d.value > 0)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Delete expense
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await api.delete(`/expenses/${id}`)
      setExpenses(prev => prev.filter(e => (e.id || e._id) !== id))
      toast.success('Expense deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  // Add expense
  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!form.title || !form.amount) return
    setSaving(true)
    try {
      const { data } = await api.post('/expenses', { ...form, amount: Number(form.amount), date: form.date instanceof Date ? form.date.toISOString().slice(0, 10) : form.date })
      setExpenses(prev => [data, ...prev])
      setShowModal(false)
      setForm(EMPTY_FORM)
      toast.success('Expense added!')
    } catch {
      toast.error('Failed to add expense')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-jade" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-sm font-body mb-1">{greeting} 👋</p>
          <h1 className="font-display font-bold text-3xl text-white">{user?.name}'s Dashboard</h1>
          <p className="text-white/35 text-sm font-body mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {alerts.length > 0 && (
            <div className="relative" ref={alertRef}>
              <button
                onClick={() => setShowAlerts(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-glow border border-amber-pxt/30 animate-pulse-glow hover:border-amber-pxt/60 transition-all"
              >
                <AlertCircle className="text-amber-pxt" size={16} />
                <span className="text-amber-pxt text-sm font-body font-medium">{alerts.length} budget alert{alerts.length > 1 ? 's' : ''}</span>
              </button>

              {/* Dropdown */}
              {showAlerts && (
                <div className="absolute right-0 top-12 w-80 z-50 animate-slide-up"
                  style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-amber-pxt" size={16} />
                      <span className="font-display font-semibold text-white text-sm">Budget Alerts</span>
                    </div>
                    <button onClick={() => setShowAlerts(false)}
                      className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {alerts.map(b => {
                      const cat = getCategoryById(b.category)
                      const spent = spentByCategory[b.category] || 0
                      const pct = Math.min(100, Math.round((spent / b.limit) * 100))
                      const over = spent > b.limit
                      return (
                        <div key={b.id || b._id}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{cat.icon}</span>
                              <span className="text-white text-sm font-body font-medium">{cat.label}</span>
                            </div>
                            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${over ? 'bg-coral/15 text-coral' : 'bg-amber-glow text-amber-pxt'}`}>
                              {over ? 'Over budget!' : `${pct}% used`}
                            </span>
                          </div>
                          <div className="progress-bar mb-1.5">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: over ? '#FF6B6B' : '#FFB347' }} />
                          </div>
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-white/35">Spent: {formatCurrency(spent)}</span>
                            <span className="text-white/35">Limit: {formatCurrency(b.limit)}</span>
                          </div>
                          {over && (
                            <p className="text-coral text-xs font-body mt-1">
                              ⚠ Over by {formatCurrency(spent - b.limit)}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-4 pb-4">
                    <a href="/budgets" className="block w-full text-center text-jade text-xs font-body hover:underline">
                      Manage Budgets →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard label="Total Spent This Month" value={formatCurrency(totalSpent)} icon="💸" color="coral"
          sub={totalBudget > 0 ? `of ${formatCurrency(totalBudget)} budget` : 'No budget set'} />
        <StatCard label="Budget Remaining" value={formatCurrency(Math.max(0, totalBudget - totalSpent))} icon="🛡️" color="jade"
          sub={totalBudget > 0 ? `${Math.max(0, Math.round(((totalBudget - totalSpent) / totalBudget) * 100))}% left` : 'Set a budget'} />
        <StatCard label="Transactions" value={expenses.length} icon="📋" color="sky" sub="Total recorded" />
        <StatCard label="Active Goals" value={goals.length} icon="🎯" color="amber"
          sub={`${goals.filter(g => g.savedAmount >= g.targetAmount).length} completed`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Spending Trend</h2>
              <p className="text-white/35 text-xs font-body mt-0.5">Monthly expenditure overview</p>
            </div>
            <span className="badge-green">This Year</span>
          </div>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-white/25 text-sm font-body">
              No expense data yet. Add your first expense!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradJade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D68F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D68F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#00D68F" strokeWidth={2} fill="url(#gradJade)"
                  dot={{ fill: '#00D68F', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#00D68F', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="col-span-2 glass-card p-6">
          <div className="mb-4">
            <h2 className="section-title">By Category</h2>
            <p className="text-white/35 text-xs font-body mt-0.5">Spending breakdown</p>
          </div>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-white/25 text-sm font-body">
              No data yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.slice(0, 4).map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-white/50 text-xs font-body">{d.name}</span>
                    </div>
                    <span className="text-white/70 text-xs font-mono">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Recent Transactions</h2>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-8 text-white/25 text-sm font-body">
              No transactions yet. Click "Add Expense" to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(exp => {
                const cat = getCategoryById(exp.category)
                return (
                  <div key={exp.id || exp._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-glass transition-all group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-body font-medium truncate">{exp.title}</p>
                      <p className="text-white/35 text-xs font-body">{cat.label} · {exp.date}</p>
                    </div>
                    <span className="font-mono text-sm font-medium text-coral flex-shrink-0">
                      -{formatCurrency(exp.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(exp.id || exp._id)}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-coral hover:bg-coral/10 transition-all flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          <div className="glass-card p-5">
            <h2 className="section-title mb-4">Budget Alerts</h2>
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 text-jade text-sm font-body">
                <CheckCircle2 size={16} />
                {budgets.length === 0 ? 'No budgets set yet' : 'All budgets on track!'}
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(b => {
                  const cat = getCategoryById(b.category)
                  const spent = spentByCategory[b.category] || 0
                  const pct = Math.min(100, Math.round((spent / b.limit) * 100))
                  const over = spent > b.limit
                  return (
                    <div key={b.id || b._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white/70 text-xs font-body flex items-center gap-1.5">{cat.icon} {cat.label}</span>
                        <span className={`text-xs font-mono ${over ? 'text-coral' : 'text-amber-pxt'}`}>{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: over ? '#FF6B6B' : '#FFB347' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <h2 className="section-title mb-4">Goals Progress</h2>
            {goals.length === 0 ? (
              <div className="text-white/25 text-sm font-body">No goals added yet</div>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map(goal => {
                  const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
                  return (
                    <div key={goal.id || goal._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white/70 text-xs font-body flex items-center gap-1.5">{goal.icon} {goal.title}</span>
                        <span className="text-jade text-xs font-mono">{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-jade" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(EMPTY_FORM) }} title="Add Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input-field" placeholder="e.g. Lunch at Café" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount (₹)</label>
              <input className="input-field" type="number" min="1" placeholder="0" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label className="label">Date</label>
              <DatePicker
                selected={form.date}
                onChange={date => setForm({ ...form, date })}
                dateFormat="dd MMM yyyy"
                maxDate={new Date()}
                className="input-field w-full"
                calendarClassName="pxt-calendar"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <input className="input-field" placeholder="Any note..." value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? 'Saving…' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
