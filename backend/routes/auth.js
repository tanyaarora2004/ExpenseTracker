const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { read, write } = require('../config/db')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' })

    const db = read()
    if (db.users.find(u => u.email === email))
      return res.status(400).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const user = { id: Date.now().toString(), name, email, password: hashed }
    db.users.push(user)
    write(db)

    const token = signToken(user.id)
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.name[0].toUpperCase() }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'All fields required' })

    const db = read()
    const user = db.users.find(u => u.email === email)
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' })

    const token = signToken(user.id)
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.name[0].toUpperCase() }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
