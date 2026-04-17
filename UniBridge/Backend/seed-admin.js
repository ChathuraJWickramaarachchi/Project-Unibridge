/**
 * Script to create initial admin user
 * Run this once to seed the database with an admin account
 * Usage: node seed-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('\nTo create a new admin, delete the existing one first or use a different email.');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@unibridge.com',
      password: 'admin123',
      phone: '+1234567890',
      address: 'Admin Office',
      role: 'admin',
      isVerified: true,
    };

    console.log('\n📝 Creating admin user...');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    
    const admin = new User(adminData);
    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@unibridge.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');
    console.log('\n🔗 You can now login at: http://localhost:8081/auth');
    console.log('   And access admin dashboard at: http://localhost:8081/admin');

    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error(error);
    process.exit(1);
  }
};

createAdminUser();
