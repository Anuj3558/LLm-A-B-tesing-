import mongoose from "mongoose";
import Dashboard from "./Admin/AdminDashboardSchema.js"; // Make sure you have this model

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "user",
      enum: ["user"]
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    },
    fullName: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    allowedModel:[{
      type: mongoose.Schema.Types.ObjectId,
      ref : "GlobalConfig" , 
      unique:true
    }]
  },
  { timestamps: true }
);

// Post-save hook to update dashboard when a new user is added
userSchema.post('save', async function(doc) {
  try {
    // Get active and total user counts for this admin
    const activeUsersCount = await mongoose.model('User').countDocuments({ 
      isActive: true, 
      adminId: doc.adminId 
    });
    
    const totalUsersCount = await mongoose.model('User').countDocuments({ 
      adminId: doc.adminId 
    });

    // Update the dashboard (without activity update)
    await Dashboard.findOneAndUpdate(
      { adminId: doc.adminId },
      {
        $set: {
          'kpiData.$[elem1].value': activeUsersCount.toString(),
          'kpiData.$[elem2].value': totalUsersCount.toString(),
          updatedAt: new Date()
        }
      },
      {
        arrayFilters: [
          { 'elem1.title': 'Active Users' },
          { 'elem2.title': 'Total Registered Users' }
        ],
        upsert: true,
        new: true
      }
    );
    
    console.log(`Dashboard updated for new user: ${doc.fullName || doc.email}`);
  } catch (error) {
    console.error('Error updating dashboard after user save:', error);
  }
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;