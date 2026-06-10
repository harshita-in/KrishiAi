const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const expectedApiKey = process.env.BACKEND_API_KEY || '';

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://krishi-ai-lyart.vercel.app'],
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
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch(err => console.error(err));

// -----------------------------------------
// ROUTE ARRANGEMENT FOR DUAL FRONTENDS
// -----------------------------------------
// Farmer Portal will hit: http://localhost:5000/api/farmer/signup
app.use('/api/farmer', require('./routes/farmerAuthRoutes'));

// Wholesaler Portal will hit: http://localhost:5000/api/wholesaler/signup
app.use('/api/wholesaler', require('./routes/wholesalerAuthRoutes'));

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(PORT, () => {
  console.log(`connected to ${PORT}`);
});
