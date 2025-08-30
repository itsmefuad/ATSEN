import mongoose from 'mongoose';
import { config } from 'dotenv';
import Admin from '../src/models/Admin.js';

// Load environment variables
config();

async function seedSuperAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if superadmin already exists
    const existingSuperAdmin = await Admin.findOne({ 
      email: process.env.SUPERADMIN_EMAIL 
    });
    
    if (existingSuperAdmin) {
      console.log('Super Administrator already exists!');
      console.log(`Email: ${existingSuperAdmin.email}`);
      console.log(`Name: ${existingSuperAdmin.name}`);
      return;
    }
    
    // Create super administrator
    const superAdmin = new Admin({
      name: process.env.SUPERADMIN_NAME || 'Super Administrator',
      email: process.env.SUPERADMIN_EMAIL || 'superadmin@atsen.com',
      password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'superadmin'
    });
    
    await superAdmin.save();
    
    console.log('✅ Super Administrator created successfully!');
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Name: ${superAdmin.name}`);
    console.log(`Password: ${process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123'}`);
    
  } catch (error) {
    console.error('❌ Error seeding super administrator:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

// Run the seeding function
seedSuperAdmin();
