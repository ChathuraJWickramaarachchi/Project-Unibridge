import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestEmployer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test employer already exists
    const existingEmployer = await User.findOne({ email: 'employer@test.com' });
    if (existingEmployer) {
      console.log('Test employer already exists');
      await mongoose.disconnect();
      return;
    }

    // Create test employer
    const employer = new User({
      firstName: 'Test',
      lastName: 'Employer',
      email: 'employer@test.com',
      password: 'password123',
      role: 'employer',
      isVerified: true,
      phone: '+1234567890',
      address: '123 Test Street, Test City'
    });

    await employer.save();
    console.log('Test employer created successfully');
    console.log('Email: employer@test.com');
    console.log('Password: password123');
    console.log('Role: employer');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test employer:', error);
    process.exit(1);
  }
};

createTestEmployer();
