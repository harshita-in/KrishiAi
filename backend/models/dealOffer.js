const mongoose = require('mongoose');

const dealOfferSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProduceListing',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  wholesaler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wholesaler',
    required: true
  },
  wholesalerName: {
    type: String,
    required: true,
    trim: true
  },
  wholesalerContact: {
    type: String,
    trim: true,
    default: ''
  },
  cropName: {
    type: String,
    required: true
  },
  offeredPricePerQuintal: {
    type: Number,
    required: true,
    min: 1
  },
  quantityQuintals: {
    type: Number,
    required: true,
    min: 0.1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    trim: true,
    default: 'Interested in purchasing this produce at the offered price.'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  farmerRemark: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('DealOffer', dealOfferSchema);
