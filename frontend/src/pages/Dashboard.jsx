import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import {
  mockExpenses, mockBudgets, mockGoals, mockUser,
  formatCurrency, getCategoryById, getSpentByCategory, getMonthlyData, CATEGORIES
} from '../utils/data'
import StatCard from '../components/ui/StatCard'
import { useAuth } from '../context/AuthContext'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-4 py-3" style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="font-mono text-jade text-sm">{formatCurrency(payload[0].value)}</p>
        <p className="text-white/50 text-xs mt-0.5">{payload[0].payload.month}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user } = useAuth()
  const name = user?.name || mockUser.name

  const totalSpent = useMemo(() => mockExpenses.reduce((s, e) => s + e.amount, 0), [])
  const totalBudget = useMemo(() => mockBudgets.reduce((s, b) => s + b.limit, 0), [])
  const spentByCategory = useMemo(() => getSpentByCategory(mockExpenses), [])
  const monthlyData = useMemo(() => getMonthlyData(mockExpenses), [])

  // Budget alerts: categories at or above 80%
  const alerts = mockBudgets.filter(b => {
    const spent = spentByCategory[b.category] || 0
    return spent / b.limit >= 0.8
  })

  // Recent 5 expenses
  const recent = [...mockExpenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  // Pie data
  const pieData = CATEGORIES.map(cat => ({
    name: cat.label,
    value: spentByCategory[cat.id] || 0,
    color: cat.color,
  })).filter(d => d.value > 0)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-sm font-body mb-1">{greeting} 👋</p>
          <h1 className="font-display font-bold text-3xl text-white">{name}'s Dashboard</h1>
          <p className="text-white/35 text-sm font-body mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-glow border border-amber-pxt/30 animate-pulse-glow">
            <AlertCircle className="text-amber-pxt" size={16} />
            <span className="text-amber-pxt text-sm font-body font-medium">{alerts.length} budget alert{alerts.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          label="Total Spent This Month"
          value={formatCurrency(totalSpent)}
          icon="💸"
          color="coral"
          sub={`of ${formatCurrency(totalBudget)} budget`}
        />
        <StatCard
          label="Budget Remaining"
          value={formatCurrency(Math.max(0, totalBudget - totalSpent))}
          icon="🛡️"
          color="jade"
          sub={`${Math.round(((totalBudget - totalSpent) / totalBudget) * 100)}% left`}
        />
        <StatCard
          label="Transactions"
          value={mockExpenses.length}
          icon="📋"
          color="sky"
          sub="This month"
        />
        <StatCard
          label="Active Goals"
          value={mockGoals.length}
          icon="🎯"
          color="amber"
          sub={`${mockGoals.filter(g => g.savedAmount >= g.targetAmount).length} completed`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-5 gap-6">
        {/* Area Chart */}
        <div className="col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Spending Trend</h2>
              <p className="text-white/35 text-xs font-body mt-0.5">Monthly expenditure overview</p>
            </div>
            <span className="badge-green">This Year</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradJade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D68F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D68F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#00D68F" strokeWidth={2} fill="url(#gradJade)" dot={{ fill: '#00D68F', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#00D68F', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="col-span-2 glass-card p-6">
          <div className="mb-4">
            <h2 className="section-title">By Category</h2>
            <p className="text-white/35 text-xs font-body mt-0.5">Spending breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontFamily: 'DM Sans', color: 'white' }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Mini legend */}
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
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-5 gap-6">
        {/* Recent transactions */}
        <div className="col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Recent Transactions</h2>
            <a href="/expenses" className="text-jade text-xs font-body hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {recent.map(exp => {
              const cat = getCategoryById(exp.category)
              return (
                <div key={exp.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-glass transition-all">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-body font-medium truncate">{exp.title}</p>
                    <p className="text-white/35 text-xs font-body">{cat.label} · {exp.date}</p>
                  </div>
                  <span className="font-mono text-sm font-medium text-coral flex-shrink-0">
                    -{formatCurrency(exp.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Budget alerts + goals mini */}
        <div className="col-span-2 space-y-4">
          {/* Alerts */}
          <div className="glass-card p-5">
            <h2 className="section-title mb-4">Budget Alerts</h2>
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 text-jade text-sm font-body">
                <CheckCircle2 size={16} />
                All budgets on track!
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(b => {
                  const cat = getCategoryById(b.category)
                  const spent = spentByCategory[b.category] || 0
                  const pct = Math.min(100, Math.round((spent / b.limit) * 100))
                  const over = spent > b.limit
                  return (
                    <div key={b.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white/70 text-xs font-body flex items-center gap-1.5">
                          {cat.icon} {cat.label}
                        </span>
                        <span className={`text-xs font-mono ${over ? 'text-coral' : 'text-amber-pxt'}`}>{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%`, background: over ? '#FF6B6B' : '#FFB347' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Goals mini */}
          <div className="glass-card p-5">
            <h2 className="section-title mb-4">Goals Progress</h2>
            <div className="space-y-3">
              {mockGoals.slice(0, 3).map(goal => {
                const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/70 text-xs font-body flex items-center gap-1.5">
                        {goal.icon} {goal.title}
                      </span>
                      <span className="text-jade text-xs font-mono">{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill bg-jade" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
