import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api/study'

function History({ darkMode }) {
  const [histories, setHistories] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API}/history`, {
       headers: { Authorization: `Bearer ${token}` }
})
      setHistories(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    await axios.delete(`${API}/history/${id}`)
    fetchHistory()
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6">💬 Chat History</h2>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && histories.length === 0 && (
        <div className={`rounded-xl p-6 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <p className="text-gray-500">No chat history yet! Start studying to save conversations.</p>
        </div>
      )}

      {histories.map(history => (
        <div key={history._id}
          className={`rounded-xl shadow p-4 mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold">📄 {history.filename}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(history.createdAt).toLocaleDateString()} •{' '}
                {history.messages.length} messages
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setExpanded(expanded === history._id ? null : history._id)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                {expanded === history._id ? 'Hide' : 'View'}
              </button>
              <button
                onClick={() => handleDelete(history._id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>

          {expanded === history._id && (
            <div className={`mt-4 rounded-lg p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {history.messages.map((msg, i) => (
                <div key={i} className={`mb-3 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.type === 'user' && (
                    <div className="inline-block bg-blue-600 text-white rounded-xl px-4 py-2 max-w-md">
                      {msg.text}
                    </div>
                  )}
                  {msg.type === 'ai' && (
                    <div className={`inline-block rounded-xl px-4 py-2 max-w-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-white border'}`}>
                      <p className="text-xs text-blue-400 mb-1">🤖 AI</p>
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default History