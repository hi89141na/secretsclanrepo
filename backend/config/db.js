const mongoose = require('mongoose');

let retryCount = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Attempting to connect to MongoDB...`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection pooling
      maxPoolSize: 10,
      minPoolSize: 5,
      
      // Timeouts
      connectTimeoutMS: 30000,      // 30 seconds for initial connection
      serverSelectionTimeoutMS: 20000, // 20 seconds for server selection
      socketTimeoutMS: 60000,        // 60 seconds for socket timeout
      
      // Retry logic
      retryWrites: true,
      retryReads: true,
      autoIndex: true,
      
      // DNS and connection settings
      family: 4,                     // Use IPv4
      appName: 'SecretsClan'
    });
    
    console.log(`? MongoDB Connected: ${conn.connection.host}`);
    retryCount = 0; // Reset retry count on successful connection
    return conn;
  } catch (error) {
    console.error(`? MongoDB Connection Error: ${error.message}`);
    
    // Retry logic with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff
      retryCount++;
      
      console.log(`Retrying connection (${retryCount}/${MAX_RETRIES}) in ${retryDelay}ms...`);
      
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          connectDB()
            .then(resolve)
            .catch(reject);
        }, retryDelay);
      });
    } else {
      console.error('? Max retries reached. Unable to connect to MongoDB.');
      console.error('');
      console.error('Possible solutions:');
      console.error('1. Check your MongoDB Atlas connection string in .env');
      console.error('2. Verify your IP is whitelisted in MongoDB Atlas');
      console.error('3. Check if MongoDB Atlas cluster is running');
      console.error('4. Verify your internet connection');
      console.error('5. Check firewall settings');
      console.error('');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
