import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Study from './pages/Study'
import Quiz from './pages/Quiz'
import Flashcards from './pages/Flashcards'
import History from './pages/History'
import Login from './pages/Login'
import Signup from './pages/Signup'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [filename, setFilename] = useState('')

  return (
    <div className={darkMode ? 'bg-gray-900 min-h-screen' : 'bg-gray-100 min-h-screen'}>
      <BrowserRouter>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path="/login" element={<Login darkMode={darkMode} />} />
          <Route path="/signup" element={<Signup darkMode={darkMode} />} />
          <Route path="/" element={
            <ProtectedRoute><Home darkMode={darkMode} /></ProtectedRoute>
          } />
          <Route path="/study" element={
            <ProtectedRoute>
              <Study darkMode={darkMode} setSessionId={setSessionId} setFilename={setFilename} />
            </ProtectedRoute>
          } />
          <Route path="/quiz" element={
            <ProtectedRoute>
              <Quiz darkMode={darkMode} sessionId={sessionId} filename={filename} />
            </ProtectedRoute>
          } />
          <Route path="/flashcards" element={
            <ProtectedRoute>
              <Flashcards darkMode={darkMode} sessionId={sessionId} />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History darkMode={darkMode} />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App