import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { CATEGORIES, getCategoryById, formatCurrency } from '../utils/data'
import api from '../utils/api'
import toast from 'react-hot-toast'

const currentMonth = new Date().toISOString().slice(0, 7)
const EMPTY = { category: 'food', limit: '', month: currentMonth }

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [bRes, eRes] = await Promise.all([
          api.get(`/budgets?month=${currentMonth}`),
          api.get(`/expenses?month=${currentMonth}`),
        ])
        setBudgets(bRes.data)
        setExpenses(eRes.data)
      } catch {
        toast.error('Failed to load budgets')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const spentByCategory = useMemo(() => {
    return expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})
  }, [expenses])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (b) => {
    setEditing(b)
    setForm({ category: b.category, limit: b.limit, month: b.month })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const { data } = await api.put(`/budgets/${editing.id || editing._id}`, { ...form, limit: Number(form.limit) })
        setBudgets(prev => prev.map(b => (b.id || b._id) === (editing.id || editing._id) ? data : b))
        toast.success('Budget updated!')
      } else {
        const { data } = await api.post('/budgets', { ...form, limit: Number(form.limit) })
        setBudgets(prev => [...prev, data])
        toast.success('Budget set!')
      }
      setShowModal(false)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return
    try {
      await api.delete(`/budgets/${id}`)
      setBudgets(prev => prev.filter(b => (b.id || b._id) !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="text-white/40 text-sm font-body mt-1">Set monthly spending limits per category</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Set Budget
        </button>
      </div>

      {/* Overview */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <p className="text-white/40 text-xs font-body mb-1">Total Budget</p>
            <p className="font-display font-bold text-xl text-white">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-white/40 text-xs font-body mb-1">Total Spent</p>
            <p className="font-display font-bold text-xl text-coral">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-white/40 text-xs font-body mb-1">Remaining</p>
            <p className="font-display font-bold text-xl text-jade">{formatCurrency(Math.max(0, totalBudget - totalSpent))}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-jade" size={28} /></div>
      ) : budgets.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">🛡️</p>
          <p className="text-white/40 font-body">No budgets set. Create one to track your spending limits.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map(b => {
            const cat = getCategoryById(b.category)
            const spent = spentByCategory[b.category] || 0
            const pct = Math.min(100, Math.round((spent / b.limit) * 100))
            const over = spent > b.limit
            const id = b.id || b._id
            return (
              <div key={id} className="glass-card p-5 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                      style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-white text-sm font-body font-medium">{cat.label}</p>
                      <p className="text-white/35 text-xs font-body">{b.month}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-mono text-sm font-semibold ${over ? 'text-coral' : 'text-white'}`}>
                        {formatCurrency(spent)}
                        <span className="text-white/30 font-normal"> / {formatCurrency(b.limit)}</span>
                      </p>
                      <p className={`text-xs font-mono ${over ? 'text-coral' : pct >= 80 ? 'text-amber-pxt' : 'text-jade'}`}>
                        {over ? `Over by ${formatCurrency(spent - b.limit)}` : `${formatCurrency(b.limit - spent)} left`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(b)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-jade hover:bg-jade/10 transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-coral hover:bg-coral/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill transition-all duration-700"
                    style={{ width: `${pct}%`, background: over ? '#FF6B6B' : pct >= 80 ? '#FFB347' : '#00D68F' }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-white/25 text-xs font-mono">0%</span>
                  <span className={`text-xs font-mono ${over ? 'text-coral' : pct >= 80 ? 'text-amber-pxt' : 'text-white/40'}`}>{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Budget' : 'Set Budget'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit (₹)</label>
            <input className="input-field" type="number" min="1" placeholder="e.g. 3000" value={form.limit}
              onChange={e => setForm({ ...form, limit: e.target.value })} required />
          </div>
          <div>
            <label className="label">Month</label>
            <input className="input-field" type="month" value={form.month}
              onChange={e => setForm({ ...form, month: e.target.value })} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? 'Saving…' : editing ? 'Update' : 'Set Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
