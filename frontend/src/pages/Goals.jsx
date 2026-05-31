import { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, Loader2, Target } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { formatCurrency } from '../utils/data'
import api from '../utils/api'
import toast from 'react-hot-toast'

const ICONS = ['🎯', '🛡️', '💻', '✈️', '🏠', '🚗', '📱', '💍', '🎓', '💰']
const EMPTY = { title: '', targetAmount: '', savedAmount: '', deadline: '', icon: '🎯' }

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showContrib, setShowContrib] = useState(null) // goal to add contribution to
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [contrib, setContrib] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/goals')
      setGoals(data)
    } catch {
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (g) => {
    setEditing(g)
    setForm({ title: g.title, targetAmount: g.targetAmount, savedAmount: g.savedAmount, deadline: g.deadline, icon: g.icon || '🎯' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, targetAmount: Number(form.targetAmount), savedAmount: Number(form.savedAmount) }
      if (editing) {
        const { data } = await api.put(`/goals/${editing.id || editing._id}`, payload)
        setGoals(prev => prev.map(g => (g.id || g._id) === (editing.id || editing._id) ? data : g))
        toast.success('Goal updated!')
      } else {
        const { data } = await api.post('/goals', payload)
        setGoals(prev => [...prev, data])
        toast.success('Goal created!')
      }
      setShowModal(false)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return
    try {
      await api.delete(`/goals/${id}`)
      setGoals(prev => prev.filter(g => (g.id || g._id) !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  // Add money to a goal
  const handleContrib = async (e) => {
    e.preventDefault()
    if (!contrib || !showContrib) return
    setSaving(true)
    try {
      const id = showContrib.id || showContrib._id
      const newSaved = Math.min(showContrib.targetAmount, showContrib.savedAmount + Number(contrib))
      const { data } = await api.put(`/goals/${id}`, { savedAmount: newSaved })
      setGoals(prev => prev.map(g => (g.id || g._id) === id ? data : g))
      toast.success(`₹${contrib} added to ${showContrib.title}!`)
      setShowContrib(null)
      setContrib('')
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="text-white/40 text-sm font-body mt-1">Save towards things that matter</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-jade" size={28} /></div>
      ) : goals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-white/40 font-body">No goals yet. Create one to start saving!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {goals.map(goal => {
            const id = goal.id || goal._id
            const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
            const done = goal.savedAmount >= goal.targetAmount
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <div key={id} className="glass-card p-6 group relative">
                {done && (
                  <div className="absolute top-4 right-4 badge-green">Completed 🎉</div>
                )}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.2)' }}>
                    {goal.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-display font-semibold text-base truncate">{goal.title}</p>
                    {goal.deadline && (
                      <p className={`text-xs font-body mt-0.5 ${daysLeft < 0 ? 'text-coral' : daysLeft < 30 ? 'text-amber-pxt' : 'text-white/35'}`}>
                        {daysLeft < 0 ? 'Deadline passed' : `${daysLeft} days left`} · {goal.deadline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-white/35 text-xs font-body">Saved</p>
                    <p className="font-mono font-bold text-jade text-lg">{formatCurrency(goal.savedAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/35 text-xs font-body">Target</p>
                    <p className="font-mono text-white/70 text-base">{formatCurrency(goal.targetAmount)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="progress-bar mb-1.5">
                  <div className="progress-fill"
                    style={{ width: `${pct}%`, background: done ? '#00D68F' : pct >= 75 ? '#00D68F' : pct >= 40 ? '#FFB347' : '#4FC3F7' }} />
                </div>
                <p className="text-white/35 text-xs font-mono mb-4">{pct}% complete</p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!done && (
                    <button onClick={() => { setShowContrib(goal); setContrib('') }}
                      className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1.5">
                      <Plus size={14} /> Add Money
                    </button>
                  )}
                  <button onClick={() => openEdit(goal)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-jade hover:bg-jade/10 transition-all border border-border">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-coral hover:bg-coral/10 transition-all border border-border">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Goal' : 'New Goal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Goal Title</label>
            <input className="input-field" placeholder="e.g. New Laptop" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                    ${form.icon === ic ? 'bg-jade/20 border-2 border-jade' : 'bg-glass border border-border hover:border-jade/40'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Target Amount (₹)</label>
              <input className="input-field" type="number" min="1" placeholder="50000" value={form.targetAmount}
                onChange={e => setForm({ ...form, targetAmount: e.target.value })} required />
            </div>
            <div>
              <label className="label">Already Saved (₹)</label>
              <input className="input-field" type="number" min="0" placeholder="0" value={form.savedAmount}
                onChange={e => setForm({ ...form, savedAmount: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Deadline</label>
            <input className="input-field" type="date" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? 'Saving…' : editing ? 'Update' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Money Modal */}
      <Modal isOpen={!!showContrib} onClose={() => setShowContrib(null)} title={`Add Money to ${showContrib?.title}`} size="sm">
        <form onSubmit={handleContrib} className="space-y-4">
          <div>
            <label className="label">Amount to Add (₹)</label>
            <input className="input-field" type="number" min="1" placeholder="e.g. 1000" value={contrib}
              onChange={e => setContrib(e.target.value)} required autoFocus />
            {showContrib && (
              <p className="text-white/30 text-xs mt-1.5 font-body">
                Current: {formatCurrency(showContrib.savedAmount)} / {formatCurrency(showContrib.targetAmount)}
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowContrib(null)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add Money
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
