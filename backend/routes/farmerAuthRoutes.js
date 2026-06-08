const express = require('express');
const router = express.Router();
const { registerFarmer, loginFarmer } = require('../controllers/farmerAuthController');
const { protect } = require('../middleware/authmiddleware');

// Public Auth Endpoints for Farmer Portal
router.post('/signup', registerFarmer);
router.post('/login', loginFarmer);

// Example of a Protected Dashboard route specifically for the Farmer Portal
router.get('/dashboard', protect('farmer'), (req, res) => {
  res.json({ message: `Welcome to the Farmer Portal Dashboard, User ${req.user.id}` });
});

module.exports = router;
