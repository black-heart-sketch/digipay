const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Debug logging for environment variables
    const uri = process.env.MONGODB_URI;
    console.log('🔍 Database Configuration:');
    console.log(`- URI defined: ${!!uri}`);
    console.log(`- URI type: ${typeof uri}`);
    if (uri) console.log(`- URI length: ${uri.length}`);
    
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't exit process, let retry logic or manual restart handle it
    // process.exit(1);
  }
};

module.exports = connectDB;
