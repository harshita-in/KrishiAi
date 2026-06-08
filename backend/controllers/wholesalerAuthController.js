const Wholesaler = require('../models/wholesaler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. WHOLESALER SIGNUP
// ==========================================
exports.registerWholesaler = async (req, res) => {
  try {
    const { name, user_id, email, password } = req.body;

    // Check if user_id already exists in the database
    const existingUser = await Wholesaler.findOne({ user_id });
    if (existingUser) {
      return res.status(400).json({ error: "User ID exists" });
    }

    // Hash the raw password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new wholesaler record
    const newWholesaler = new Wholesaler({ 
      name, 
      user_id, 
      email, 
      password: hashedPassword 
    });
    await newWholesaler.save();

    res.status(201).json({ message: "Wholesaler registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 2. WHOLESALER LOGIN
// ==========================================
exports.loginWholesaler = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    // Attempt to locate wholesaler by user_id
    const wholesaler = await Wholesaler.findOne({ user_id });
    if (!wholesaler) {
      return res.status(400).json({ error: "Invalid User ID or Password" });
    }

    // Compare submitted password against the stored hashed password
    const isMatch = await bcrypt.compare(password, wholesaler.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid User ID or Password" });
    }

    // Issue JWT with explicit "wholesaler" role configuration
    const token = jwt.sign(
      { id: wholesaler._id, role: 'wholesaler' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // Send the token along with limited profile data back to client
    res.status(200).json({ 
      token, 
      user: { 
        name: wholesaler.name, 
        user_id: wholesaler.user_id,
        email: wholesaler.email
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};