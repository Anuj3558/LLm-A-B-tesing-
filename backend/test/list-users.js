import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import Admin from '../models/AdminModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database Name: ${mongoose.connection.name}`);
    
    // Get all users
    const users = await User.find().select('username fullName email adminId allowedModels');
    console.log(`\n👥 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.username}`);
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Full Name: ${user.fullName || 'Not set'}`);
      console.log(`   - Email: ${user.email || 'Not set'}`);
      console.log(`   - Admin ID: ${user.adminId}`);
      console.log(`   - Allowed Models: ${user.allowedModels ? user.allowedModels.length : 0} models`);
      if (user.allowedModels && user.allowedModels.length > 0) {
        console.log(`     Models: ${JSON.stringify(user.allowedModels, null, 6)}`);
      }
    });
    
    // Get all admins
    const admins = await Admin.find().select('username email');
    console.log(`\n👨‍💼 Found ${admins.length} admins:`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Admin: ${admin.username} (${admin._id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

listUsers();
