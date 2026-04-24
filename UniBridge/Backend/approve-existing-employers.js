import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const approveExistingEmployers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unibridge');
    console.log('✅ Connected to MongoDB');

    // Find all employers who don't have approvalStatus field (existing users)
    const existingEmployers = await User.find({
      role: 'employer',
      approvalStatus: { $exists: false }
    });

    console.log(`\n📊 Found ${existingEmployers.length} existing employer(s) to approve\n`);

    if (existingEmployers.length === 0) {
      console.log('✅ No existing employers need approval');
      process.exit(0);
    }

    // Approve each employer
    for (const employer of existingEmployers) {
      console.log(`Approving: ${employer.email} (${employer.firstName} ${employer.lastName})`);
      
      employer.isApproved = true;
      employer.approvalStatus = 'approved';
      await employer.save();
    }

    console.log(`\n✅ Successfully approved ${existingEmployers.length} employer(s)`);
    console.log('🎉 All existing employers can now login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

approveExistingEmployers();
