const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'notification'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  conversationId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create conversation ID from two user IDs (sorted for consistency)
messageSchema.statics.getConversationId = function(userId1, userId2) {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);
