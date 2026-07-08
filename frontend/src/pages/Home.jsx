import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">🎓 AI Study Assistant</h1>
        <p className="text-xl mb-8">Upload your notes and ask any question — AI will answer from your documents!</p>
        <Link to="/study"
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100">
          Start Studying →
        </Link>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto p-10">
        <h2 className="text-2xl font-bold text-center mb-8">How it works</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-4xl mb-3">📄</p>
            <h3 className="font-bold text-lg mb-2">Upload PDF</h3>
            <p className="text-gray-500 text-sm">Upload your study notes or textbook in PDF format</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-4xl mb-3">❓</p>
            <h3 className="font-bold text-lg mb-2">Ask Questions</h3>
            <p className="text-gray-500 text-sm">Ask anything about your uploaded document</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-4xl mb-3">🤖</p>
            <h3 className="font-bold text-lg mb-2">Get AI Answers</h3>
            <p className="text-gray-500 text-sm">Get instant accurate answers powered by Google Gemini AI</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home