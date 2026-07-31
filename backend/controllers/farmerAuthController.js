const Farmer = require('../models/farmer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// 1. FARMER SIGNUP
exports.registerFarmer = async (req, res) => {
  try {
    const { name, user_id, email, password, location } = req.body;
    const normalizedLocation = (() => {
      if (Array.isArray(location) && location.length === 2) {
        const longitude = Number(location[0]);
        const latitude = Number(location[1]);
        if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
          return { longitude, latitude };
        }
        return undefined;
      }

      if (location && typeof location === 'object') {
        const longitude = Number(location.longitude ?? location.lng);
        const latitude = Number(location.latitude ?? location.lat);
        if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
          return { longitude, latitude };
        }
      }

      return undefined;
    })();

    // Check if user_id or email already exists
    const existingUser = await Farmer.findOne({
      $or: [{ user_id }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({
        error: existingUser.user_id === user_id
          ? 'User ID exists'
          : 'Email exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Farmer
    const newFarmer = new Farmer({
      name,
      user_id,
      email,
      password: hashedPassword,
      ...(normalizedLocation ? { location: normalizedLocation } : {})
    });
    await newFarmer.save();

    const token = jwt.sign(
      { id: newFarmer._id, role: 'farmer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: "Farmer registered successfully!",
      token,
      user: {
        name: newFarmer.name,
        user_id: newFarmer.user_id,
        email: newFarmer.email
      }
    });
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0];
      return res.status(400).json({
        error: duplicateField === 'email' ? 'Email exists' : 'User ID exists'
      });
    }
    res.status(500).json({ error: error.message });
  }
};

// 2. SAVE FARMER LOCATION
exports.saveFarmerLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'Missing or invalid coordinates' });
    }

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      req.user.id,
      { location: { longitude: lng, latitude: lat } },
      { new: true, runValidators: true }
    );

    if (!updatedFarmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json({
      status: 'success',
      message: 'Location received securely',
      location: updatedFarmer.location
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. GET FARMER PROFILE
exports.getFarmerProfile = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.user.id).select('name user_id email location createdAt updatedAt');

    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json({
      user: {
        name: farmer.name,
        user_id: farmer.user_id,
        email: farmer.email,
        location: farmer.location || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. UPDATE FARMER PROFILE
exports.updateFarmerProfile = async (req, res) => {
  try {
    const { name, user_id, email } = req.body;

    const farmer = await Farmer.findById(req.user.id);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const nextUserId = typeof user_id === 'string' ? user_id.trim() : farmer.user_id;
    const nextName = typeof name === 'string' ? name.trim() : farmer.name;
    const nextEmail = typeof email === 'string' ? email.trim().toLowerCase() : farmer.email;

    if (nextUserId && nextUserId !== farmer.user_id) {
      const existingUser = await Farmer.findOne({ user_id: nextUserId, _id: { $ne: farmer._id } });
      if (existingUser) {
        return res.status(400).json({ error: 'User ID exists' });
      }
      farmer.user_id = nextUserId;
    }

    if (nextEmail && nextEmail !== farmer.email) {
      const existingEmail = await Farmer.findOne({ email: nextEmail, _id: { $ne: farmer._id } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email exists' });
      }
      farmer.email = nextEmail;
    }

    farmer.name = nextName;

    await farmer.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        name: farmer.name,
        user_id: farmer.user_id,
        email: farmer.email
      }
    });
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0];
      return res.status(400).json({
        error: duplicateField === 'email' ? 'Email exists' : 'User ID exists'
      });
    }
    res.status(500).json({ error: error.message });
  }
};

// 4. FARMER LOGIN
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
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        name: farmer.name,
        user_id: farmer.user_id,
        email: farmer.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
