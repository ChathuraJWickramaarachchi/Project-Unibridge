const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Provided (hidden for security)' : 'NOT PROVIDED');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    console.log(`✅ Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide helpful troubleshooting tips
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n⚠️  DNS Resolution Error:');
      console.error('   - Check your internet connection');
      console.error('   - Verify MongoDB Atlas cluster URL is correct');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\n⚠️  Authentication Error:');
      console.error('   - Check username and password in connection string');
      console.error('   - Ensure user has proper database permissions');
    } else if (error.message.includes('IP address whitelisting')) {
      console.error('\n⚠️  IP Whitelist Error:');
      console.error('   - Add your IP address to MongoDB Atlas whitelist');
      console.error('   - Or temporarily allow access from anywhere (0.0.0.0/0)');
    } else if (error.message.includes('timeout')) {
      console.error('\n⚠️  Connection Timeout:');
      console.error('   - Check your internet connection');
      console.error('   - Verify MongoDB Atlas cluster is running');
      console.error('   - Check firewall settings');
    }
    
    console.error('\n⚠️  Proceeding without database connection.');
    console.error('   API endpoints requiring database will fail.');
    throw error; // Re-throw to prevent server from starting with broken DB
  }
};

module.exports = connectDB;