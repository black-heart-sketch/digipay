require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User'); // Adjust path as needed
const connectDB = require('../src/config/database'); // Adjust path as needed

const createAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@digipay.com';
    const password = 'admin123'; // Default password

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      console.log('⚠️ User already exists');
      if (user.role !== 'admin') {
        console.log('🔄 Updating user role to admin...');
        user.role = 'admin';
        await user.save();
        console.log('✅ User updated to admin');
      } else {
        console.log('✅ User is already an admin');
      }
    } else {
      console.log('🆕 Creating new admin user...');
      user = await User.create({
        email,
        password,
        role: 'admin',
        emailVerified: true
      });
      console.log('✅ Admin user created successfully');
    }

    console.log('-----------------------------------');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
