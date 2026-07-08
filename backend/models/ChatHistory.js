const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  messages: [
    {
      type: {
        type: String,
        enum: ['user', 'ai', 'system'],
      },
      text: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('ChatHistory', chatHistorySchema);