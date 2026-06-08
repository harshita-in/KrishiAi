const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware to parse JSON request bodies
app.use(express.json());

// -----------------------------------------
// 1. DATABASE CONNECTION & SCHEMA LOADING
// -----------------------------------------
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB");
    
    // Registering the schemas to the DB by importing them
    // (Ensure these file paths match where you saved your model files)
    require('./models/crop');
    require('./models/farmer');
    require('./models/wholesaler');
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// -----------------------------------------
// 2. ROUTES
// -----------------------------------------
// Root route displaying status on the browser tab
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// -----------------------------------------
// 3. SERVER START
// -----------------------------------------
app.listen(PORT, () => {
  console.log(`connected to ${PORT}`);
});