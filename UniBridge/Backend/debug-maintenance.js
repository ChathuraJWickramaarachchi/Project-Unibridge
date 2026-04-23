// Debug script to test maintenance mode behavior
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Maintenance from './models/Maintenance.js';
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unibridge')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function debugMaintenance() {
  try {
    console.log('\n🔍 Maintenance Mode Debug\n');

    // 1. Check for active maintenance
    const maintenance = await Maintenance.findOne({
      isMaintenanceMode: true,
      status: 'active',
    });

    if (!maintenance) {
      console.log('❌ No active maintenance mode found');
      console.log('\n💡 To activate maintenance mode:');
      console.log('   1. Login as admin');
      console.log('   2. Go to /admin/maintenance');
      console.log('   3. Create maintenance and click "Activate Mode"');
      process.exit(0);
    }

    console.log('✅ Active maintenance found:');
    console.log('   Title:', maintenance.title);
    console.log('   Status:', maintenance.status);
    console.log('   isMaintenanceMode:', maintenance.isMaintenanceMode);
    console.log('   Affected Users:', maintenance.affectedUsers);
    console.log('   Start Time:', maintenance.scheduledStartTime);
    console.log('   End Time:', maintenance.scheduledEndTime);
    console.log('\n');

    // 2. Get all users and check their roles
    const users = await User.find().select('email role firstName');
    
    console.log(`👥 Found ${users.length} users:\n`);
    
    for (const user of users) {
      const isAffected = maintenance.affectedUsers.includes('all') || 
                        maintenance.affectedUsers.includes(user.role);
      const isAdmin = user.role === 'admin';
      
      console.log(`User: ${user.email}`);
      console.log(`  Role: ${user.role} (type: ${typeof user.role})`);
      console.log(`  Is Admin: ${isAdmin}`);
      console.log(`  Is Affected: ${isAffected}`);
      console.log(`  Expected Access: ${isAdmin ? '✅ YES (Admin)' : (isAffected ? '🚫 NO (Blocked)' : '✅ YES (Not affected)')}`);
      console.log('');
    }

    // 3. Test specific scenarios
    console.log('\n🧪 Expected Behavior:\n');
    
    const adminUser = users.find(u => u.role === 'admin');
    const studentUser = users.find(u => u.role === 'student');
    const employerUser = users.find(u => u.role === 'employer');

    if (adminUser) {
      console.log(`Admin (${adminUser.email}):`);
      console.log('  Should ALWAYS have access ✅');
      console.log('');
    }

    if (maintenance.affectedUsers.includes('student') && studentUser) {
      console.log(`Student (${studentUser.email}):`);
      console.log('  Should be BLOCKED 🚫');
      console.log('');
    }

    if (maintenance.affectedUsers.includes('employer') && employerUser) {
      console.log(`Employer (${employerUser.email}):`);
      console.log('  Should be BLOCKED 🚫');
      console.log('');
    }

    if (!maintenance.affectedUsers.includes('student') && !maintenance.affectedUsers.includes('all') && studentUser) {
      console.log(`Student (${studentUser.email}):`);
      console.log('  Should have access ✅ (not affected)');
      console.log('');
    }

    if (!maintenance.affectedUsers.includes('employer') && !maintenance.affectedUsers.includes('all') && employerUser) {
      console.log(`Employer (${employerUser.email}):`);
      console.log('  Should have access ✅ (not affected)');
      console.log('');
    }

    console.log('\n💡 If behavior does not match, check:');
    console.log('   1. Backend console logs when user tries to access');
    console.log('   2. User role in database: db.users.findOne({email: "user@email.com"}, {role: 1})');
    console.log('   3. Maintenance affectedUsers: db.maintenances.findOne({isMaintenanceMode: true}, {affectedUsers: 1})');
    console.log('\n📌 Note: Auth and 2FA routes are EXEMPT from maintenance mode');
    console.log('   Users can always login, even during maintenance!');

  } catch (error) {
    console.error('\n❌ Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the debug
debugMaintenance();
