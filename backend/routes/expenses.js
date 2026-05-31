const router = require('express').Router()
const auth = require('../middleware/auth')
const { read, write } = require('../config/db')

router.use(auth)

router.get('/', (req, res) => {
  const db = read()
  let expenses = db.expenses.filter(e => e.userId === req.user.id)
  if (req.query.month) expenses = expenses.filter(e => e.date.startsWith(req.query.month))
  res.json(expenses.sort((a, b) => new Date(b.date) - new Date(a.date)))
})

router.post('/', (req, res) => {
  const db = read()
  const expense = { id: Date.now().toString(), userId: req.user.id, ...req.body }
  db.expenses.push(expense)
  write(db)
  res.status(201).json(expense)
})

router.put('/:id', (req, res) => {
  const db = read()
  const idx = db.expenses.findIndex(e => e.id === req.params.id && e.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  db.expenses[idx] = { ...db.expenses[idx], ...req.body }
  write(db)
  res.json(db.expenses[idx])
})

router.delete('/:id', (req, res) => {
  const db = read()
  const idx = db.expenses.findIndex(e => e.id === req.params.id && e.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  db.expenses.splice(idx, 1)
  write(db)
  res.json({ message: 'Deleted' })
})

module.exports = router
