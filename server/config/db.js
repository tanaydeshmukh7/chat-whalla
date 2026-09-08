const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // First try connecting to the configured MongoDB URI
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.log(`⚠️  Could not connect to MongoDB at ${uri}`);
    console.log('   Falling back to in-memory MongoDB...\n');
  }

  // Fallback: start an in-memory MongoDB server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();

    const conn = await mongoose.connect(memUri);
    console.log(`✅ In-Memory MongoDB started: ${memUri}`);
    console.log('   ⚠️  Data will be lost when server stops.\n');
    console.log('   💡 To persist data, install MongoDB locally or use MongoDB Atlas.\n');
  } catch (memError) {
    console.error(`❌ Failed to start in-memory MongoDB: ${memError.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
