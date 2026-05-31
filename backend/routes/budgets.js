const router = require('express').Router()
const auth = require('../middleware/auth')
const { read, write } = require('../config/db')

router.use(auth)

router.get('/', (req, res) => {
  const db = read()
  let budgets = db.budgets.filter(b => b.userId === req.user.id)
  if (req.query.month) budgets = budgets.filter(b => b.month === req.query.month)
  res.json(budgets)
})

router.post('/', (req, res) => {
  const db = read()
  const budget = { id: Date.now().toString(), userId: req.user.id, ...req.body }
  db.budgets.push(budget)
  write(db)
  res.status(201).json(budget)
})

router.put('/:id', (req, res) => {
  const db = read()
  const idx = db.budgets.findIndex(b => b.id === req.params.id && b.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  db.budgets[idx] = { ...db.budgets[idx], ...req.body }
  write(db)
  res.json(db.budgets[idx])
})

router.delete('/:id', (req, res) => {
  const db = read()
  const idx = db.budgets.findIndex(b => b.id === req.params.id && b.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  db.budgets.splice(idx, 1)
  write(db)
  res.json({ message: 'Deleted' })
})

module.exports = router
