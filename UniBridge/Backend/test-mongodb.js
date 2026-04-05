const mongoose = require('mongoose');
require('dotenv').config();

console.log('=== MongoDB Connection Diagnostic Tool ===\n');
console.log('MongoDB URI:', process.env.MONGODB_URI ? '✓ Provided' : '✗ NOT PROVIDED');
if (process.env.MONGODB_URI) {
  // Hide password for security
  const uriParts = process.env.MONGODB_URI.split('@');
  if (uriParts.length > 1) {
    const creds = uriParts[0].split('://')[1];
    const host = uriParts[1];
    console.log('Connection String Format: ✓ Valid');
    console.log('Host:', host);
  }
}
console.log('\n');

async function testConnection() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in .env file');
    return;
  }

  try {
    console.log('🔄 Attempting to connect...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('\n✅ CONNECTION SUCCESSFUL!\n');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Port:', conn.connection.port);
    
    // Test basic operation
    console.log('\n🔄 Testing database operations...');
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections found:', collections.length);
    if (collections.length > 0) {
      console.log('Collection names:', collections.map(c => c.name).join(', '));
    }
    
    console.log('\n✅ All tests passed! Your MongoDB connection is working properly.');
    
    await mongoose.disconnect();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error('Error:', error.message);
    console.error('\n--- Troubleshooting Steps ---\n');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('1. DNS Resolution Error');
      console.error('   → Check your internet connection');
      console.error('   → Verify MongoDB Atlas cluster URL is correct');
      console.error('   → Try pinging the MongoDB host');
    } else if (error.message.includes('Authentication failed')) {
      console.error('1. Authentication Error');
      console.error('   → Check username and password in connection string');
      console.error('   → Ensure special characters are properly encoded');
      console.error('   → Verify user has proper database permissions');
      console.error('   → Check if user was created in the correct database');
    } else if (error.message.includes('IP address whitelisting')) {
      console.error('1. IP Whitelist Error');
      console.error('   → Go to MongoDB Atlas → Network Access');
      console.error('   → Add your current IP address to the whitelist');
      console.error('   → OR temporarily allow access from anywhere (0.0.0.0/0)');
      console.error('   → Wait 2-3 minutes for changes to take effect');
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.error('1. Connection Timeout');
      console.error('   → Check your internet connection');
      console.error('   → Verify MongoDB Atlas cluster is running');
      console.error('   → Check firewall settings');
      console.error('   → Ensure MongoDB Atlas allows connections from your region');
    } else if (error.message.includes('buffering timed out')) {
      console.error('1. Query Buffering Timeout');
      console.error('   → MongoDB connection is not established');
      console.error('   → Check all the above points');
      console.error('   → Restart your backend server after fixing issues');
    }
    
    console.error('\n--- Common Solutions ---\n');
    console.error('• Verify your MongoDB Atlas connection string is correct');
    console.error('• Check Network Access settings in MongoDB Atlas');
    console.error('• Ensure your password doesn\'t contain unescaped special characters');
    console.error('• Try connecting from MongoDB Compass to test credentials');
    console.error('• Check if your MongoDB Atlas cluster is paused or stopped');
    
    await mongoose.disconnect();
    process.exit(1);
  }
}

testConnection();
