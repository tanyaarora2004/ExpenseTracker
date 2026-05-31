const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true, trim: true },
  category: { type: String, required: true },
  amount:   { type: Number, required: true, min: 0 },
  date:     { type: String, required: true }, // YYYY-MM-DD
  note:     { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Expense', expenseSchema)
