const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

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