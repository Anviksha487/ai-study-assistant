import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api/study'

function Flashcards({ darkMode, sessionId }) {
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const generateFlashcards = async () => {
    if (!sessionId) return alert('Please upload a PDF first!')
    setLoading(true)
    setFlipped(false)
    setCurrentIndex(0)
    try {
      const res = await axios.post(`${API}/flashcards`, { sessionId })
      setFlashcards(res.data.flashcards)
    } catch (err) {
      alert('Failed to generate flashcards!')
    }
    setLoading(false)
  }

  const handleNext = () => {
    setFlipped(false)
    setTimeout(() => setCurrentIndex(prev => Math.min(prev + 1, flashcards.length - 1)), 200)
  }

  const handlePrev = () => {
    setFlipped(false)
    setTimeout(() => setCurrentIndex(prev => Math.max(prev - 1, 0)), 200)
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🃏 Flashcards</h2>
        <button
          onClick={generateFlashcards}
          disabled={loading || !sessionId}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50">
          {loading ? '⏳ Generating...' : '🃏 Generate Flashcards'}
        </button>
      </div>

      {!sessionId && (
        <div className={`rounded-xl p-6 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <p className="text-gray-500">Please upload a PDF on the Study page first!</p>
        </div>
      )}

      {flashcards.length > 0 && (
        <>
          {/* Progress */}
          <p className="text-center mb-4 text-gray-500">
            Card {currentIndex + 1} of {flashcards.length}
          </p>

          {/* Flashcard */}
          <div
            onClick={() => setFlipped(!flipped)}
            className={`cursor-pointer rounded-2xl shadow-lg p-10 text-center min-h-64 flex items-center justify-center mb-6 transition-all duration-300
              ${flipped
                ? 'bg-blue-600 text-white'
                : darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}>
            <div>
              <p className="text-xs uppercase tracking-wide mb-4 opacity-60">
                {flipped ? '✅ Answer' : '❓ Question'}
              </p>
              <p className="text-xl font-semibold">
                {flipped ? flashcards[currentIndex].back : flashcards[currentIndex].front}
              </p>
              <p className="text-xs mt-4 opacity-50">Click to flip</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 disabled:opacity-50">
              ← Previous
            </button>
            <button
              onClick={() => setFlipped(!flipped)}
              className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700">
              🔄 Flip
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 disabled:opacity-50">
              Next →
            </button>
          </div>

          {/* All cards grid */}
          <div className="mt-8">
            <h3 className="font-semibold mb-4">All Flashcards</h3>
            <div className="grid grid-cols-2 gap-4">
              {flashcards.map((card, i) => (
                <div
                  key={i}
                  onClick={() => { setCurrentIndex(i); setFlipped(false) }}
                  className={`rounded-xl p-4 cursor-pointer border-2 transition-all
                    ${currentIndex === i ? 'border-blue-500' : 'border-transparent'}
                    ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <p className="text-xs text-blue-500 mb-1">Card {i + 1}</p>
                  <p className="text-sm font-semibold">{card.front}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Flashcards