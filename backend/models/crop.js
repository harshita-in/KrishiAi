const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true // Ensures crop IDs are unique
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageLink: {
    type: String,
    default: "" // Optional field
  }
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);