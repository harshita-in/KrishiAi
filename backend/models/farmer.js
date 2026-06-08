const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  user_id: {
    type: String,
    required: true,
    unique: true, // Mongoose will throw an error if a duplicate user_id is inserted
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
  },
  crops: [{
    type: Number, // Stores an array of Crop IDs (integers)
    ref: 'Crop'   // References the Crop model
  }],
  location: {
    type: [Number], // Represents [longitude, latitude] or [x, y] coordinates
    default: undefined,
    validate: {
      validator: function(val) {
        if (val == null || val.length === 0) return true;
        return val.length === 2;
      },
      message: 'Location must strictly contain 2 coordinates (X and Y).'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);
