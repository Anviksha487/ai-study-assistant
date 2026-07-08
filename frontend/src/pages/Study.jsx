import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api/study'

function Study({ darkMode, setSessionId: updateSessionId, setFilename: updateFilename }) {
  const [file, setFile] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [filename, setFilename] = useState('')
  const [pages, setPages] = useState(0)
  const [uploadedPDFs, setUploadedPDFs] = useState([])
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [listening, setListening] = useState(false)
  const [summary, setSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const handleUpload = async () => {
    if (!file) return alert('Please select a PDF file!')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      const res = await axios.post(`${API}/upload`, formData)
      setSessionId(res.data.sessionId)
      setFilename(res.data.filename)
      
      
      if (updateSessionId) updateSessionId(res.data.sessionId)
      if (updateFilename) updateFilename(res.data.filename)
      setPages(res.data.pages)
      setMessages([{
        type: 'system',
        text: `✅ "${res.data.filename}" uploaded! Ask me anything about it!`
      }])
      setUploadedPDFs(prev => [...prev, {
       sessionId: res.data.sessionId,
       filename: res.data.filename
     }])
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed!')
    }
    setFile(null)
// Reset file input
const fileInput = document.querySelector('input[type="file"]')
if (fileInput) fileInput.value = ''
    setUploading(false)
  }

  const handleAsk = async () => {
    if (!sessionId) return alert('Please upload a PDF first!')
    if (!question.trim()) return alert('Please ask a question!')
    const userQuestion = question
    setQuestion('')
    setMessages(prev => [...prev, { type: 'user', text: userQuestion }])
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
const res = await axios.post(`${API}/ask`, { sessionId, question: userQuestion }, {
  headers: { Authorization: `Bearer ${token}` }
})
      setMessages(prev => [...prev, { type: 'ai', text: res.data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, { type: 'error', text: 'Failed to get answer. Try again!' }])
    }
    setLoading(false)
  }
  const handleSummary = async () => {
    if (!sessionId) return alert('Please upload a PDF first!')
    setSummarizing(true)
    setShowSummary(true)
    try {
      const res = await axios.post(`${API}/summary`, { sessionId })
      setSummary(res.data.summary)
    } catch (err) {
      setSummary('Failed to generate summary!')
    }
    setSummarizing(false)
  }
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return alert('Voice input not supported in this browser! Use Chrome.')
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setQuestion(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.start()
  }
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6">📚 Study Session</h2>
      {/* Summary Section */}
      {showSummary && (
        <div className={`rounded-xl shadow p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">📝 Summary</h3>
            <button onClick={() => setShowSummary(false)}
              className="text-gray-400 hover:text-red-500">✕ Close</button>
          </div>
          {summarizing ? (
            <p className="text-blue-500">⏳ Generating summary...</p>
          ) : (
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {summary}
            </p>
          )}
        </div>
      )}
      {/* Upload Section */}
      <div className={`rounded-xl shadow p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="font-semibold text-lg mb-4">📄 Upload Your Notes</h3>
        <div className="flex gap-3 items-center">
          <input
            type="file"
            accept=".pdf"
            onChange={e => setFile(e.target.files[0])}
            className={`border rounded p-2 flex-1 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {uploading ? '⏳ Uploading...' : '📤 Upload PDF'}
          </button>
          <button
            onClick={handleSummary}
            disabled={!sessionId || summarizing}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50">
            {summarizing ? '⏳' : '📝 Summary'}
          </button>
        </div>
        {filename && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
            <p className="text-green-700 text-sm">
              ✅ <strong>{filename}</strong> loaded!
            </p>
          </div>
        )}
        {/* PDF List */}
{uploadedPDFs.length > 1 && (
  <div className="mt-4">
    <h4 className="font-semibold text-sm mb-2">📚 Uploaded PDFs:</h4>
    <div className="flex flex-wrap gap-2">
      {uploadedPDFs.map((pdf, i) => (
        <button
          key={i}
          onClick={() => {
            setSessionId(pdf.sessionId)
            setFilename(pdf.filename)
            if (updateSessionId) updateSessionId(pdf.sessionId)
            if (updateFilename) updateFilename(pdf.filename)
            setMessages([{
              type: 'system',
              text: `📄 Switched to "${pdf.filename}"`
            }])
          }}
          className={`px-3 py-1 rounded-full text-sm border transition-all
            ${sessionId === pdf.sessionId
              ? 'bg-blue-600 text-white border-blue-600'
              : darkMode ? 'border-gray-600 text-gray-300 hover:border-blue-400' : 'border-gray-300 hover:border-blue-400'
            }`}>
          📄 {pdf.filename}
        </button>
      ))}
    </div>
  </div>
)}
      </div>

      {/* Chat Section */}
      <div className={`rounded-xl shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="font-semibold text-lg mb-4">💬 Ask Questions</h3>

        {/* Messages */}
        <div className={`rounded-lg p-4 h-96 overflow-y-auto mb-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {messages.length === 0 && (
            <p className={`text-center mt-32 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Upload a PDF and start asking questions!
            </p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
              {msg.type === 'user' && (
                <div className="inline-block bg-blue-600 text-white rounded-xl px-4 py-2 max-w-xs lg:max-w-md">
                  {msg.text}
                </div>
              )}
              {msg.type === 'ai' && (
                <div className={`inline-block rounded-xl px-4 py-2 max-w-xs lg:max-w-md shadow-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-white border text-gray-800'}`}>
                  <p className="text-xs text-blue-400 font-semibold mb-1">🤖 AI Answer</p>
                  {msg.text}
                </div>
              )}
              {msg.type === 'system' && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-green-700 text-sm">
                  {msg.text}
                </div>
              )}
              {msg.type === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-red-700 text-sm">
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="text-left mb-4">
              <div className={`inline-block rounded-xl px-4 py-2 shadow-sm ${darkMode ? 'bg-gray-700' : 'bg-white border'}`}>
                <p className="text-blue-400">🤖 AI is thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            className={`border rounded-xl p-3 flex-1 ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : ''}`}
            placeholder="Ask a question about your notes..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!sessionId}
          />
          <button
    
            onClick={handleVoiceInput}
            disabled={!sessionId}
            className={`px-4 py-3 rounded-xl ${listening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'} text-white hover:opacity-80 disabled:opacity-50`}>
            {listening ? '🔴' : '🎤'}
          </button>
          <button
            onClick={handleAsk}
            disabled={loading || !sessionId}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50">
            {loading ? '⏳' : 'Ask'}
          </button>
        </div>
        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Press Enter to ask</p>
      </div>
    </div>
  )
}

export default Study