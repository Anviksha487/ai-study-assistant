import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api/study'

function Quiz({ darkMode, sessionId, filename }) {
  const [quiz, setQuiz] = useState([])
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const generateQuiz = async () => {
    if (!sessionId) return alert('Please upload a PDF first!')
    setLoading(true)
    setSubmitted(false)
    setAnswers({})
    try {
      const res = await axios.post(`${API}/quiz`, { sessionId })
      setQuiz(res.data.quiz)
    } catch (err) {
      alert('Failed to generate quiz!')
    }
    setLoading(false)
  }

  const handleAnswer = (index, option) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [index]: option }))
  }

  const handleSubmit = () => {
    let correct = 0
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++
    })
    setScore(correct)
    setSubmitted(true)
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">❓ Quiz Generator</h2>
        <button
          onClick={generateQuiz}
          disabled={loading || !sessionId}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50">
          {loading ? '⏳ Generating...' : '🎯 Generate Quiz'}
        </button>
      </div>

      {!sessionId && (
        <div className={`rounded-xl p-6 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <p className="text-gray-500">Please upload a PDF on the Study page first!</p>
        </div>
      )}

      {quiz.length > 0 && (
        <>
          {submitted && (
            <div className={`rounded-xl p-4 mb-6 text-center ${score >= 3 ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="text-2xl font-bold">
                {score >= 3 ? '🎉' : '😔'} Score: {score}/{quiz.length}
              </p>
              <p className={score >= 3 ? 'text-green-600' : 'text-red-600'}>
                {score >= 3 ? 'Great job!' : 'Keep studying!'}
              </p>
            </div>
          )}

          {quiz.map((q, i) => (
            <div key={i} className={`rounded-xl shadow p-6 mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className="font-semibold mb-4">
                {i + 1}. {q.question}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((option, j) => (
                  <button
                    key={j}
                    onClick={() => handleAnswer(i, option)}
                    className={`p-3 rounded-lg text-left text-sm border transition-all
                      ${answers[i] === option && !submitted ? 'border-blue-500 bg-blue-50 text-blue-700' : ''}
                      ${submitted && option === q.answer ? 'border-green-500 bg-green-50 text-green-700' : ''}
                      ${submitted && answers[i] === option && option !== q.answer ? 'border-red-500 bg-red-50 text-red-700' : ''}
                      ${!answers[i] || answers[i] !== option ? darkMode ? 'border-gray-600 hover:border-blue-400' : 'border-gray-200 hover:border-blue-300' : ''}
                    `}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.length}
              className="bg-green-600 text-white px-8 py-3 rounded-xl w-full hover:bg-green-700 disabled:opacity-50">
              Submit Quiz
            </button>
          )}

          {submitted && (
            <button
              onClick={generateQuiz}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl w-full hover:bg-blue-700 mt-4">
              🔄 Generate New Quiz
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default Quiz