import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockUser } from '../utils/data'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleMockLogin = () => {
    setLoading(true)
    setTimeout(() => {
      login(mockUser, 'mock-token')
      setLoading(false)
      navigate('/dashboard')
    }, 400)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="w-full max-w-md p-8 glass-card">
        <h1 className="page-title mb-2">Welcome back</h1>
        <p className="text-white/50 mb-6">Sign in to continue to PxT — Personal Expense Tracker</p>

        <button
          onClick={handleMockLogin}
          className="btn-primary w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in (mock)'}
        </button>
      </div>
    </div>
  )
}
