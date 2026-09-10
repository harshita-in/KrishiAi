const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const expectedApiKey = process.env.BACKEND_API_KEY || '';

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ],
  credentials: true,
}));

app.use('/api', (req, res, next) => {
  if (!expectedApiKey) {
    return next();
  }

  const receivedApiKey = req.headers['x-api-key'];
  if (receivedApiKey !== expectedApiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
});

// Connect DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/krishiai')
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch(err => console.error(err));

// -----------------------------------------
// ROUTE ARRANGEMENT FOR DUAL FRONTENDS & SERVICES
// -----------------------------------------
// Farmer Auth & Profile
app.use('/api/farmer', require('./routes/farmerAuthRoutes'));

// Wholesaler Auth
app.use('/api/wholesaler', require('./routes/wholesalerAuthRoutes'));

// B2B Marketplace & Bidding
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));

// Agro-Intelligence (Disease AI, Crop Recommendation, Mandi Rates, Weather)
app.use('/api/agro', require('./routes/agroRoutes'));

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(PORT, () => {
  console.log(`connected to ${PORT}`);
});
