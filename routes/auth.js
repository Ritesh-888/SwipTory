const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config(); // Load environment variables from .env file

// Error handler middleware
const errorHandler = (res, error) => {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name,  password } = req.body;
    // console.log(name, email, mobile, password)
    // Check if all required fields are provided
    if (!name  || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ name,   password: hashedPassword });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ user: user.name }, process.env.JWT_SECRET_KEY); // Replace 'SECRET_KEY' with your own secret key

    // Return success response
    res.json({ success: true, token, user:user});
  } catch (error) {
    errorHandler(res, error);
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    // Check if email and password are provided
    if (!name || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'SECRET_KEY'); // Replace 'SECRET_KEY' with your own secret key

    // Return success response
    res.json({ success: true, token, user:user });
  } catch (error) {
    errorHandler(res, error);
  }
});

module.exports = router;