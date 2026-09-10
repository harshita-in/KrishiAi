const mongoose = require('mongoose');

const produceListingSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  farmerName: {
    type: String,
    required: true,
    trim: true
  },
  farmerContact: {
    type: String,
    trim: true,
    default: ''
  },
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  variety: {
    type: String,
    trim: true,
    default: 'Standard / Desi'
  },
  quantityQuintals: {
    type: Number,
    required: true,
    min: 0.1
  },
  expectedPricePerQuintal: {
    type: Number,
    required: true,
    min: 1
  },
  harvestDate: {
    type: String,
    default: 'Ready for Dispatch'
  },
  location: {
    district: { type: String, default: 'Local Mandi Area' },
    state: { type: String, default: 'India' },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'under_negotiation', 'sold', 'archived'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('ProduceListing', produceListingSchema);
