const mongoose = require('mongoose');
const dns = require('dns');
const { URL } = require('url');

let retryTimer = null;
const RETRY_INTERVAL_MS = 30000; // Retry every 30 seconds

/**
 * Resolve an mongodb+srv:// URI to a standard mongodb:// URI using
 * Google's public DNS (8.8.8.8) to bypass ISP DNS that blocks SRV lookups.
 */
const resolveSrvUri = (mongoUri) => {
  return new Promise((resolve, reject) => {
    if (!mongoUri.startsWith('mongodb+srv://')) {
      return resolve(mongoUri); // already a standard URI, nothing to do
    }

    // Extract the host from the SRV URI
    // e.g. mongodb+srv://user:pass@cluster0.quqtvwh.mongodb.net/db?opts
    const withoutScheme = mongoUri.slice('mongodb+srv://'.length);
    const atIdx = withoutScheme.indexOf('@');
    const credentials = withoutScheme.slice(0, atIdx);         // user:pass
    const rest = withoutScheme.slice(atIdx + 1);               // host/db?opts
    const slashIdx = rest.indexOf('/');
    const srvHost = slashIdx !== -1 ? rest.slice(0, slashIdx) : rest;
    const pathAndQuery = slashIdx !== -1 ? rest.slice(slashIdx) : '';

    const srvName = `_mongodb._tcp.${srvHost}`;
    console.log(`🔍 Resolving SRV record via Google DNS (8.8.8.8): ${srvName}`);

    // Use Google's DNS server for SRV resolution
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '8.8.4.4']);

    resolver.resolveSrv(srvName, (err, addresses) => {
      if (err) return reject(new Error(`SRV lookup failed via Google DNS: ${err.message}`));

      // Build host list from SRV records
      const hosts = addresses.map((a) => `${a.name}:${a.port}`).join(',');
      const standardUri = `mongodb://${credentials}@${hosts}${pathAndQuery}&ssl=true&authSource=admin`;
      console.log(`✅ SRV resolved to ${addresses.length} host(s) via Google DNS`);
      resolve(standardUri);
    });
  });
};

const attemptConnect = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', 'Provided (hidden for security)');

    // Resolve SRV via Google DNS if needed (bypasses broken system DNS)
    const resolvedUri = await resolveSrvUri(process.env.MONGODB_URI);

    const conn = await mongoose.connect(resolvedUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    console.log(`✅ Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    return true;
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
    } else if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('not authorized')) {
      console.error('\n⚠️  IP Whitelist Error:');
      console.error('   - Add your IP address to MongoDB Atlas Network Access whitelist');
      console.error('   - Or temporarily allow access from anywhere (0.0.0.0/0)');
    } else if (error.message.includes('querySrv') || error.message.includes('_mongodb._tcp')) {
      console.error('\n⚠️  SRV DNS lookup failed:');
      console.error('   - Check that your MongoDB Atlas cluster host is correct.');
      console.error('   - Ensure your network and DNS allow SRV record resolution.');
      console.error('   - Try switching to a standard mongodb:// URI in your .env file.');
    } else if (error.message.includes('timeout')) {
      console.error('\n⚠️  Connection Timeout:');
      console.error('   - Check your internet connection');
      console.error('   - Verify MongoDB Atlas cluster is running');
      console.error('   - Check firewall settings');
    }

    return false;
  }
};

const scheduleRetry = () => {
  if (retryTimer) return; // Already scheduled
  console.log(`\n🔄 Will retry MongoDB connection in ${RETRY_INTERVAL_MS / 1000}s...`);
  retryTimer = setTimeout(async () => {
    retryTimer = null;
    const connected = await attemptConnect();
    if (!connected) scheduleRetry();
  }, RETRY_INTERVAL_MS);
};

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in your .env file.');
    console.error('   Server will start but all database operations will fail.');
    return;
  }

  const connected = await attemptConnect();

  if (!connected) {
    console.error('\n⚠️  Server is starting WITHOUT a database connection.');
    console.error('   API endpoints requiring the database will return errors.');
    console.error('   Fix the connection issue above and the server will auto-retry.');
    scheduleRetry();
  }

  // Re-schedule retries on disconnect
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Scheduling reconnect...');
    scheduleRetry();
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully.');
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  });
};

module.exports = connectDB;