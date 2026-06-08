const express = require('express');
const router = express.Router();

// Import the wholesaler controller functions 
const { registerWholesaler, loginWholesaler } = require('../controllers/wholesalerAuthController');

// Import the authorization guard middleware
const { protect } = require('../middleware/authmiddleware');

// -----------------------------------------
// PUBLIC ROUTES (Wholesaler Portal)
// -----------------------------------------

// Route: POST /api/wholesaler/signup
// Desc:  Register a new wholesaler account
router.post('/signup', registerWholesaler);

// Route: POST /api/wholesaler/login
// Desc:  Authenticate wholesaler & generate JWT token
router.post('/login', loginWholesaler);

// -----------------------------------------
// PROTECTED ROUTES (Wholesaler Portal Only)
// -----------------------------------------

// Route: GET /api/wholesaler/dashboard
// Desc:  An example of a protected dashboard route restricted strictly to wholesalers
router.get('/dashboard', protect('wholesaler'), (req, res) => {
  res.json({ 
    message: `Welcome to the Wholesaler Portal Dashboard!`,
    user: req.user // Contains decoded token payload (id, role, etc.)
  });
});

module.exports = router;

