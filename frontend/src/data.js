// Mock data — replace with real API calls when backend is ready

export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍜', color: '#FF6B6B' },
  { id: 'transport', label: 'Transport', icon: '🚌', color: '#4FC3F7' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#FFB347' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#C084FC' },
  { id: 'health', label: 'Health', icon: '💊', color: '#00D68F' },
  { id: 'education', label: 'Education', icon: '📚', color: '#F472B6' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#6EE7B7' },
  { id: 'other', label: 'Other', icon: '📦', color: '#94A3B8' },
]

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[7]

export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)

export const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatMonth = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

// Mock store — simulates what backend will provide
const today = new Date()
const y = today.getFullYear()
const m = String(today.getMonth() + 1).padStart(2, '0')

export const mockExpenses = [
  { id: '1', title: 'Lunch at Café', category: 'food', amount: 320, date: `${y}-${m}-01`, note: 'Had a great meal' },
  { id: '2', title: 'Metro Card Recharge', category: 'transport', amount: 500, date: `${y}-${m}-02`, note: '' },
  { id: '3', title: 'Amazon Order', category: 'shopping', amount: 1450, date: `${y}-${m}-03`, note: 'Books and stationery' },
  { id: '4', title: 'Netflix Subscription', category: 'entertainment', amount: 649, date: `${y}-${m}-04`, note: '' },
  { id: '5', title: 'Pharmacy', category: 'health', amount: 280, date: `${y}-${m}-05`, note: '' },
  { id: '6', title: 'Udemy Course', category: 'education', amount: 399, date: `${y}-${m}-06`, note: 'React course' },
  { id: '7', title: 'Electricity Bill', category: 'utilities', amount: 1200, date: `${y}-${m}-07`, note: '' },
  { id: '8', title: 'Dinner Out', category: 'food', amount: 720, date: `${y}-${m}-08`, note: '' },
  { id: '9', title: 'Cab Rides', category: 'transport', amount: 380, date: `${y}-${m}-09`, note: '' },
  { id: '10', title: 'Clothes Shopping', category: 'shopping', amount: 2100, date: `${y}-${m}-10`, note: '' },
  { id: '11', title: 'Gym Membership', category: 'health', amount: 800, date: `${y}-${m}-11`, note: '' },
  { id: '12', title: 'Breakfast', category: 'food', amount: 180, date: `${y}-${m}-12`, note: '' },
]

export const mockBudgets = [
  { id: '1', category: 'food', limit: 3000, month: `${y}-${m}` },
  { id: '2', category: 'transport', limit: 1500, month: `${y}-${m}` },
  { id: '3', category: 'shopping', limit: 4000, month: `${y}-${m}` },
  { id: '4', category: 'entertainment', limit: 1000, month: `${y}-${m}` },
  { id: '5', category: 'health', limit: 2000, month: `${y}-${m}` },
]

export const mockGoals = [
  { id: '1', title: 'Emergency Fund', targetAmount: 50000, savedAmount: 22000, deadline: `${y}-12-31`, icon: '🛡️' },
  { id: '2', title: 'New Laptop', targetAmount: 80000, savedAmount: 35000, deadline: `${y + 1}-03-31`, icon: '💻' },
  { id: '3', title: 'Goa Trip', targetAmount: 20000, savedAmount: 18500, deadline: `${y}-11-30`, icon: '✈️' },
]

export const mockUser = {
  name: 'Tanisha',
  email: 'tanisha@example.com',
  avatar: 'T',
}

// Compute spent per category from expenses
export const getSpentByCategory = (expenses) => {
  return expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {})
}

// Monthly spending for chart
export const getMonthlyData = (expenses) => {
  const months = {}
  expenses.forEach((e) => {
    const key = e.date.slice(0, 7)
    months[key] = (months[key] || 0) + e.amount
  })
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month: formatMonth(month + '-01'), total }))
}
