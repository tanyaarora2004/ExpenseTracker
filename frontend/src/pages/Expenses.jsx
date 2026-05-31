import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Pencil, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { CATEGORIES, getCategoryById, formatCurrency, formatMonth } from '../utils/data'
import api from '../utils/api'
import toast from 'react-hot-toast'

const EMPTY = { title: '', category: 'food', amount: '', date: new Date().toISOString().slice(0, 10), note: '' }

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function addMonths(dateStr, n) {
  const [y, m] = dateStr.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return getMonthKey(d)
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [currentMonth, setCurrentMonth] = useState(getMonthKey())

  useEffect(() => {
    fetchExpenses(currentMonth)
  }, [currentMonth])

  const fetchExpenses = async (month) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/expenses?month=${month}`)
      setExpenses(data)
    } catch {
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY, date: `${currentMonth}-01` })
    setShowModal(true)
  }
  const openEdit = (exp) => {
    setEditing(exp)
    setForm({ title: exp.title, category: exp.category, amount: exp.amount, date: exp.date, note: exp.note || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const { data } = await api.put(`/expenses/${editing.id || editing._id}`, { ...form, amount: Number(form.amount) })
        setExpenses(prev => prev.map(e => (e.id || e._id) === (editing.id || editing._id) ? data : e))
        toast.success('Expense updated!')
      } else {
        const { data } = await api.post('/expenses', { ...form, amount: Number(form.amount) })
        // only add to list if it belongs to current month
        if (data.date.startsWith(currentMonth)) setExpenses(prev => [data, ...prev])
        toast.success('Expense added!')
      }
      setShowModal(false)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await api.delete(`/expenses/${id}`)
      setExpenses(prev => prev.filter(e => (e.id || e._id) !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = expenses
    .filter(e => filterCat === 'all' || e.category === filterCat)
    .filter(e => e.title.toLowerCase().includes(search.toLowerCase()))

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  // Group by date
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(e => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const isCurrentMonth = currentMonth === getMonthKey()
  const displayMonth = formatMonth(currentMonth + '-01')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="text-white/40 text-sm font-body mt-1">Track every rupee you spend</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-between glass-card px-5 py-3">
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-glass transition-all">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-display font-semibold text-white">{displayMonth}</p>
          {isCurrentMonth && <p className="text-jade text-xs font-body">Current month</p>}
        </div>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          disabled={isCurrentMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-glass transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input-field pl-9" placeholder="Search expenses..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="glass-card px-5 py-3 flex items-center justify-between">
          <span className="text-white/40 text-sm font-body">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''} in {displayMonth}</span>
          <span className="font-mono text-coral font-semibold">{formatCurrency(total)}</span>
        </div>
      )}

      {/* Grouped list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-jade" size={28} /></div>
      ) : grouped.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-white/40 font-body">No expenses in {displayMonth}.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, items]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-white/35 text-xs font-body font-medium">
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-white/25 text-xs font-mono">
                  {formatCurrency(items.reduce((s, e) => s + e.amount, 0))}
                </span>
              </div>

              <div className="glass-card divide-y divide-border">
                {items.map(exp => {
                  const cat = getCategoryById(exp.category)
                  const id = exp.id || exp._id
                  return (
                    <div key={id} className="flex items-center gap-4 px-5 py-4 hover:bg-glass transition-all group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-body font-medium truncate">{exp.title}</p>
                        <p className="text-white/35 text-xs font-body">{cat.label}{exp.note ? ` · ${exp.note}` : ''}</p>
                      </div>
                      <span className="font-mono text-sm font-semibold text-coral flex-shrink-0">-{formatCurrency(exp.amount)}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(exp)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-jade hover:bg-jade/10 transition-all">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-coral hover:bg-coral/10 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <input className="input-field" type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} required />
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
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? 'Saving…' : editing ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
