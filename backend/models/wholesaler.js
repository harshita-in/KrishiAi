const mongoose = require('mongoose');

const wholesalerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  user_id: {
    type: String,
    required: true,
    unique: true, // Throws error on DB level if duplicate exists
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Wholesaler', wholesalerSchema);