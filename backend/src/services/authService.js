const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const crypto = require('crypto');

/**
 * Generate JWT token
 * @param {String} userId - User ID
 * @returns {String} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register new merchant
 * @param {Object} userData - Registration data
 * @returns {Object} User and merchant details with token
 */
const register = async (userData) => {
  try {
    const { email, password, businessName, businessType, country, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user
    const user = new User({
      email,
      password,
      role: 'merchant',
      verificationToken: crypto.randomBytes(32).toString('hex'),
    });

    await user.save();

    // Create merchant profile
    const merchant = new Merchant({
      userId: user._id,
      businessName,
      businessType,
      country,
      phone,
    });

    await merchant.save();

    // Generate token
    const token = generateToken(user._id);

    return {
      user,
      merchant,
      token,
    };

  } catch (error) {
    console.error('❌ Error registering user:', error.message);
    throw error;
  }
};

/**
 * Login user
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User details with token
 */
const login = async (email, password) => {
  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Get merchant profile
    let merchant = null;
    if (user.role === 'merchant') {
      merchant = await Merchant.findOne({ userId: user._id });
    }

    // Generate token
    const token = generateToken(user._id);

    return {
      user,
      merchant,
      token,
    };

  } catch (error) {
    console.error('❌ Error logging in:', error.message);
    throw error;
  }
};

/**
 * Get current user profile
 * @param {String} userId - User ID
 * @returns {Object} User and merchant details
 */
const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let merchant = null;
    if (user.role === 'merchant') {
      merchant = await Merchant.findOne({ userId: user._id });
    }

    return {
      user,
      merchant,
    };

  } catch (error) {
    console.error('❌ Error getting profile:', error.message);
    throw error;
  }
};

/**
 * Update merchant profile
 * @param {String} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated profile
 */
const updateProfile = async (userId, updateData) => {
  try {
    const { businessName, businessType, phone, country, feePayer } = updateData;

    const merchant = await Merchant.findOne({ userId });
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    if (businessName) merchant.businessName = businessName;
    if (businessType) merchant.businessType = businessType;
    if (phone) merchant.phone = phone;
    if (country) merchant.country = country;
    if (feePayer) merchant.feePayer = feePayer;

    await merchant.save();

    const user = await User.findById(userId).select('-password');

    return {
      user,
      merchant,
    };

  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  generateToken,
};
