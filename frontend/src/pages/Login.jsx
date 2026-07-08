import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:5000/api/auth'

function Login({ darkMode }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) return setError('Please fill all fields!')
    try {
      const res = await axios.post(`${API}/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('name', res.data.name)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`rounded-xl shadow p-8 w-full max-w-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          🎓 AI Study Assistant
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <input
          className={`border rounded p-2 w-full mb-3 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className={`border rounded p-2 w-full mb-4 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded w-full hover:bg-blue-700 mb-3">
          Login
        </button>
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login