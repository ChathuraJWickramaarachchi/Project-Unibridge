// Test script to verify maintenance email sending
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import { sendMaintenanceNotification } from './config/email.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unibridge')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function testMaintenanceEmails() {
  try {
    console.log('\n🧪 Testing Maintenance Email System\n');

    // Create a test maintenance object
    const testMaintenance = {
      title: 'Test Maintenance - Database Upgrade',
      description: 'This is a test maintenance notification to verify the email system is working correctly.',
      severity: 'medium',
      type: 'scheduled',
      scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      scheduledEndTime: new Date(Date.now() + 26 * 60 * 60 * 1000),   // Day after tomorrow
    };

    console.log('📋 Test Maintenance Details:');
    console.log(testMaintenance);
    console.log('\n');

    // Get all verified users
    const users = await User.find({ isVerified: true })
      .select('email firstName')
      .limit(5); // Limit to 5 for testing

    console.log(`👥 Found ${users.length} verified users\n`);

    if (users.length === 0) {
      console.log('❌ No verified users found in database');
      console.log('Please create some test users first');
      process.exit(1);
    }

    // Send test emails
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        console.log(`\n📧 Sending email to: ${user.email} (${user.firstName})`);
        
        await sendMaintenanceNotification(
          user.email,
          user.firstName || 'User',
          testMaintenance
        );
        
        successCount++;
        console.log(`✅ Success (${successCount}/${users.length})`);
      } catch (error) {
        failCount++;
        console.log(`❌ Failed: ${error.message}`);
      }

      // Add a small delay between emails
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 Test Results:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Total: ${users.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Email system is working! Check the inboxes.');
    } else {
      console.log('\n❌ Email system failed. Check the error logs above.');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the test
testMaintenanceEmails();
