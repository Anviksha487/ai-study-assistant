import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:5000/api/auth'

function Signup({ darkMode }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async () => {
    if (!name || !email || !password) return setError('Please fill all fields!')
    try {
      const res = await axios.post(`${API}/signup`, { name, email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('name', res.data.name)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`rounded-xl shadow p-8 w-full max-w-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          🎓 Create Account
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <input
          className={`border rounded p-2 w-full mb-3 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
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
          onClick={handleSignup}
          className="bg-blue-600 text-white px-6 py-2 rounded w-full hover:bg-blue-700 mb-3">
          Sign Up
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup