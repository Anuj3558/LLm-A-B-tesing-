// Simple script to create an admin user for testing
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/AdminModel.js';

dotenv.config();

async function createTestAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/llm-testing');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'testadmin' });
    
    if (existingAdmin) {
      console.log('Test admin already exists:', existingAdmin.username);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create test admin
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    
    const admin = new Admin({
      username: 'testadmin',
      password: hashedPassword,
      role: 'admin' // Explicitly set role
    });

    await admin.save();
    console.log('Test admin created successfully!');
    console.log('Username: testadmin');
    console.log('Password: testpassword');
    console.log('Role:', admin.role);
    
  } catch (error) {
    console.error('Error creating test admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestAdmin();
