const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PdfReader } = require('pdfreader');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ChatHistory = require('../models/ChatHistory');
const auth = require('../middleware/auth');
const documentStore = {}

const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed!'))
    }
  }
})

const parsePDF = (buffer) => {
  return new Promise((resolve, reject) => {
    let text = ''
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) reject(err)
      else if (!item) resolve(text)
      else if (item.text) text += item.text + ' '
    })
  })
}

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded!' })
    const text = await parsePDF(req.file.buffer)
    const sessionId = Date.now().toString()
    documentStore[sessionId] = {
      text,
      filename: req.file.originalname,
    }
    res.json({ 
      sessionId,
      filename: req.file.originalname,
      pages: 1,
      message: 'PDF uploaded successfully!'
    })
  } catch (err) {
    console.error('UPLOAD ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/ask', async (req, res) => {
  try {
    const { sessionId, question } = req.body
    if (!sessionId || !documentStore[sessionId]) {
      return res.status(400).json({ message: 'Please upload a PDF first!' })
    }
    if (!question) {
      return res.status(400).json({ message: 'Please ask a question!' })
    }
    const document = documentStore[sessionId]
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful study assistant. Answer questions based only on the following document content:\n\n${document.text.substring(0, 10000)}`
        },
        {
          role: 'user',
          content: question
        }
      ],
      model: 'llama-3.1-8b-instant',
    })
    
    const answer = completion.choices[0]?.message?.content || 'No answer found!'

    // Save to MongoDB
    await ChatHistory.findOneAndUpdate(
      { sessionId, userId: req.userId },
      {
        $set: { filename: document.filename },
        $push: {
          messages: [
            { type: 'user', text: question },
            { type: 'ai', text: answer }
          ]
        }
      },
      { upsert: true, new: true }
    )

    res.json({ answer, question })
  } catch (err) {
    console.error('ASK ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

router.get('/document/:sessionId', (req, res) => {
  const doc = documentStore[req.params.sessionId]
  if (!doc) return res.status(404).json({ message: 'Document not found!' })
  res.json({ filename: doc.filename })
})
// Generate summary
router.post('/summary',auth, async (req, res) => {
  try {
    const { sessionId } = req.body
    if (!sessionId || !documentStore[sessionId]) {
      return res.status(400).json({ message: 'Please upload a PDF first!' })
    }
    const document = documentStore[sessionId]
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Create a clear, concise summary of the provided document.'
        },
        {
          role: 'user',
          content: `Please summarize this document in a clear and structured way with key points:\n\n${document.text.substring(0, 10000)}`
        }
      ],
      model: 'llama-3.1-8b-instant',
    })
    const summary = completion.choices[0]?.message?.content || 'Could not generate summary!'
    res.json({ summary })
  } catch (err) {
    console.error('SUMMARY ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})
// Generate quiz
router.post('/quiz', async (req, res) => {
  try {
    const { sessionId } = req.body
    if (!sessionId || !documentStore[sessionId]) {
      return res.status(400).json({ message: 'Please upload a PDF first!' })
    }
    const document = documentStore[sessionId]
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Generate MCQ quiz questions from the document. Always respond with valid JSON only, no extra text.'
        },
        {
          role: 'user',
          content: `Generate 5 multiple choice questions from this document. Return ONLY a JSON array in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "answer": "A) Option 1"
  }
]

Document: ${document.text.substring(0, 8000)}`
        }
      ],
      model: 'llama-3.1-8b-instant',
    })
    
    let quizText = completion.choices[0]?.message?.content || '[]'
    quizText = quizText.replace(/```json/g, '').replace(/```/g, '').trim()
    const quiz = JSON.parse(quizText)
    res.json({ quiz })
  } catch (err) {
    console.error('QUIZ ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})
// Generate flashcards
router.post('/flashcards', async (req, res) => {
  try {
    const { sessionId } = req.body
    if (!sessionId || !documentStore[sessionId]) {
      return res.status(400).json({ message: 'Please upload a PDF first!' })
    }
    const document = documentStore[sessionId]
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Generate flashcards from the document. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: `Generate 8 flashcards from this document. Return ONLY a JSON array in this exact format:
[
  {
    "front": "Question or term here",
    "back": "Answer or definition here"
  }
]

Document: ${document.text.substring(0, 8000)}`
        }
      ],
      model: 'llama-3.1-8b-instant',
    })
    
    let flashcardsText = completion.choices[0]?.message?.content || '[]'
    flashcardsText = flashcardsText.replace(/```json/g, '').replace(/```/g, '').trim()
    const flashcards = JSON.parse(flashcardsText)
    res.json({ flashcards })
  } catch (err) {
    console.error('FLASHCARD ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})
// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const histories = await ChatHistory.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(10)
    res.json(histories)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete chat history
router.delete('/history/:id', async (req, res) => {
  try {
    await ChatHistory.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
module.exports = router;