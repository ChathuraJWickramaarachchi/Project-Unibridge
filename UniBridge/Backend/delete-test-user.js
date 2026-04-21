// Script to delete test user so you can test role selection again
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const deleteTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const email = 'dasanayakadushan@gmail.com';
    
    const user = await User.findOne({ email });
    
    if (user) {
      await User.deleteOne({ email });
      console.log(`✅ Deleted user: ${email}`);
      console.log('🔄 Now you can sign in with Google again and see role selection!');
    } else {
      console.log(`⚠️  User not found: ${email}`);
    }

    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

deleteTestUser();
