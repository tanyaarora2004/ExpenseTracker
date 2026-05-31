const router = require('express').Router()
const auth = require('../middleware/auth')
const { read, write } = require('../config/db')

router.use(auth)

router.get('/', (req, res) => {
  const db = read()
  res.json(db.goals.filter(g => g.userId === req.user.id))
})

router.post('/', (req, res) => {
  const db = read()
  const goal = { id: Date.now().toString(), userId: req.user.id, ...req.body }
  db.goals.push(goal)
  write(db)
  res.status(201).json(goal)
})

router.put('/:id', (req, res) => {
  const db = read()
  const idx = db.goals.findIndex(g => g.id === req.params.id && g.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  db.goals[idx] = { ...db.goals[idx], ...req.body }
  write(db)
  res.json(db.goals[idx])
})

router.delete('/:id', (req, res) => {
  const db = read()
  const idx = db.goals.findIndex(g => g.id === req.params.id && g.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  db.goals.splice(idx, 1)
  write(db)
  res.json({ message: 'Deleted' })
})

module.exports = router
