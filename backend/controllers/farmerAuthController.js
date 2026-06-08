const Farmer = require('../models/farmer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. FARMER SIGNUP
exports.registerFarmer = async (req, res) => {
  try {
    const { name, user_id, email, password, location } = req.body;

    // Check if user_id already exists
    const existingUser = await Farmer.findOne({ user_id });
    if (existingUser) return res.status(400).json({ error: "User ID exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Farmer
    const newFarmer = new Farmer({ name, user_id, email, password: hashedPassword, location });
    await newFarmer.save();

    res.status(201).json({ message: "Farmer registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. FARMER LOGIN
exports.loginFarmer = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    const farmer = await Farmer.findOne({ user_id });
    if (!farmer) return res.status(400).json({ error: "Invalid User ID or Password" });

    const isMatch = await bcrypt.compare(password, farmer.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid User ID or Password" });

    // Issue Token with "farmer" role payload
    const token = jwt.sign(
      { id: farmer._id, role: 'farmer' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    res.json({ token, user: { name: farmer.name, user_id: farmer.user_id } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};