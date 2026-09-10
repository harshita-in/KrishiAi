const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  authorRole: {
    type: String,
    enum: ['Farmer', 'Agri Expert', 'KVK Scientist', 'Agricultural Officer'],
    default: 'Farmer'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  cropTag: {
    type: String,
    default: 'General'
  },
  category: {
    type: String,
    enum: ['Pest & Disease', 'Organic Farming', 'Mandi & Price', 'Machinery & Tools', 'General'],
    default: 'General'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  replies: [
    {
      authorName: { type: String, required: true },
      authorRole: { type: String, default: 'Farmer' },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
