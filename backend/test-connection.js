// Test script to verify database connection and environment variables
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('=== Environment Variables Check ===');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('ADMIN_SECRET:', process.env.ADMIN_SECRET ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || '5001 (default)');

if (!process.env.MONGO_URI) {
  console.error('\n❌ MONGO_URI is not set!');
  console.error('Please create a .env file in the backend folder with your MongoDB Atlas connection string.');
  process.exit(1);
}

console.log('\n=== Testing MongoDB Connection ===');

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ MongoDB connected successfully!');
    console.log('Connection details:');
    console.log('- Host:', mongoose.connection.host);
    console.log('- Database:', mongoose.connection.name);
    console.log('- Port:', mongoose.connection.port);
    console.log('- Is Atlas:', mongoose.connection.host?.includes('mongodb.net'));
    
    // Test creating a collection
    const testCollection = mongoose.connection.collection('test_connection');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Database write test successful!');
    
    // Clean up test data
    await testCollection.deleteOne({ test: true });
    console.log('✅ Database cleanup successful!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check your MONGO_URI format');
    console.error('2. Verify your MongoDB Atlas cluster is running');
    console.error('3. Check if your IP is whitelisted in Atlas');
    console.error('4. Verify username/password are correct');
    console.error('5. Ensure the database name exists');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ Connection closed');
    }
    process.exit(0);
  }
}

testConnection();
