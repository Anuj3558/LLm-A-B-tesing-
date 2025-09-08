// controllers/adminController.js
import Admin from "../../models/AdminModel.js";
import User from "../../models/UserModel.js";
import bcrypt from "bcryptjs";
import verifySecretKey from "../../middleware/VerifySecrete.js";
import { initializeDashboard } from "../../services/dashboardUtils.js";
import AdminDashboard from "../../models/Admin/AdminDashboardSchema.js";
import AllModelsConfig from "../../models/AllModelConfig.js";
// Function to verify secret key


// Add new admin
export const addAdmin = async (req, res) => {
  try {
    // Verify secret key
    if (!verifySecretKey(req, res)) return;

    const { username, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin username already exists in Admins" });
    }

    // Check if username exists in Users collection
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Admin username already exists in Users" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = new Admin({
      username,
      password: hashedPassword
    });

    await newAdmin.save();
   initializeDashboard(newAdmin._id); // Initialize dashboard for the new admin
    res.status(201).json({ message: "Admin created successfully", adminId: newAdmin._id });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all admin usernames
export const getAllAdminUsernames = async (req, res) => {
  try {
    // Verify secret key
    if (!verifySecretKey(req, res)) return;

    const admins = await Admin.find({}, "username");
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//add new user
// Add User function
export const addUser = async (req, res) => {
  try {
    const { email, password, fullName, username } = req.body;
    const adminId = req.user.id; // Admin ID from authenticated user

    console.log("Adding new user by admin:", adminId);

    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({ 
        message: "Email, username, and password are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if user already exists in User collection
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({ 
          message: "User with this email already exists" 
        });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ 
          message: "Username is already taken" 
        });
      }
    }

    // Check if username exists in Admin collection
    const existingAdmin = await Admin.findOne({ username: username });
    if (existingAdmin) {
      return res.status(409).json({ 
        message: "Username is already taken" 
      });
    }

    // Verify that the admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        message: "Admin not found" 
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password: hashedPassword,
      fullName: fullName?.trim() || "",
      adminId: adminId,
      role: "user",
      isActive: true
    });

    // Save user to database
    const savedUser = await newUser.save();
    // Update dashboard recent activity for this admin
    await AdminDashboard.findOneAndUpdate(
      { adminId: adminId },
      {
      $push: {
        recentActivity: {
        type: "user_added",
        user: savedUser.fullName,
        status: "success",
        time: new Date().toDateString(),
        action: `New user '${savedUser.fullName}' added by admin`
        }
      }
      }
    );

    // Return success response (excluding password)
    res.status(201).json({
      message: "User created successfully",
      user: {
      id: savedUser._id,
      email: savedUser.email,
      username: savedUser.username,
      fullName: savedUser.fullName,
      role: savedUser.role,
      isActive: savedUser.isActive,
      adminId: savedUser.adminId,
      createdAt: savedUser.createdAt
      }
    });

  } catch (error) {
    console.error("Error creating user:", error);
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({ 
        message: `${field} already exists` 
      });
    }

    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all users (for admin)
export const getAllUsers = async (req, res) => {
  try {
    const adminId = req.user.id; // Admin ID from authenticated user
    console.log("Fetching all users for admin:", adminId);
    
    // Verify that the admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        message: "Admin not found" 
      });
    }

    // Get all users under this admin
    const users = await User.find({ adminId })
      .select('-password');
    
    // Process users to include model names instead of IDs
    const processedUsers = await Promise.all(
      users.map(async (user) => {
        // Filter out null values from allowedModel
        const validModelIds = user.allowedModel.filter(modelId => modelId !== null);
        
        // Fetch model names from AllModelsConfig
        const modelNames = await Promise.all(
          validModelIds.map(async (modelId) => {
            try {
              const model = await AllModelsConfig.findById(modelId);
              return model ? model.name : 'Unknown Model';
            } catch (error) {
              console.error(`Error fetching model ${modelId}:`, error);
              return 'Unknown Model';
            }
          })
        );
        
        return {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          allowedModel: modelNames,
          isActive: user.isActive,
          adminId: user.adminId,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      })
    );
    
    res.status(200).json({
      message: "Users fetched successfully",
      users: processedUsers
    });
    
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Toggling user status for user ID:", id);
    const adminId = req.user.id; // Admin ID from authenticated user
   console.log("Toggling user status by admin:", adminId);
    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }
    console.log("Found user:", user);
    // Verify that this user belongs to the admin
    if (user.adminId== adminId) {
      return res.status(403).json({ 
        message: "You can only manage your own users" 
      });
    }
     
    // Toggle the active status
    user.isActive = !user.isActive;
    console.log("User status toggled to:", user.isActive);
    await user.save();
    await AdminDashboard.findOneAndUpdate(
      { adminId: adminId },
      {
      $push: {
        recentActivity: {
        type: "user_Updated",
        user: user.fullName,
        status: "success",
        time: new Date().toDateString(),
        action: `Status Of '${user.fullName}' Updated by admin`
        }
      }
      }
    );
    res.status(200).json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update user configuration
export const updateUserConfig = async (req, res) => {
  try {
    const { userId } = req.params;
    const { config } = req.body;
    const adminId = req.user.id; // Admin ID from authenticated user

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Verify that this user belongs to the admin
    if (user.adminId.toString() !== adminId) {
      return res.status(403).json({ 
        message: "You can only manage your own users" 
      });
    }

    // Update user configuration
    user.config = config;
    await user.save();

    res.status(200).json({
      message: "User configuration updated successfully",
      user: {
        id: user._id,
        username: user.username,
        config: user.config
      }
    });

  } catch (error) {
    console.error("Error updating user config:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get single user details
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id; // Admin ID from authenticated user

    // Find the user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Verify that this user belongs to the admin
    if (user.adminId.toString() !== adminId) {
      return res.status(403).json({ 
        message: "You can only view your own users" 
      });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        adminId: user.adminId,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        config: user.config
      }
    });

  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update user details
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { modelIds } = req.body;
    const adminId = req.user.id; // Admin ID from authenticated user
    const filteredModelIds = modelIds.filter(id => id !== null);
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Verify that this user belongs to the admin
    if (user.adminId.toString() !== adminId.toString()) {
      return res.status(403).json({ 
        message: "You can only update your own users" 
      });
    }

    // Only push model IDs that are not already in allowedModel
    /*filteredModelIds.forEach(modelId => {
      if (!user.allowedModel.includes(modelId)) {
        user.allowedModel.push(modelId);
      }
    });*/
    // Replace allowedModel array (add + remove support)
    user.allowedModel = filteredModelIds;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        adminId: user.adminId,
        allowedModel: user.allowedModel, // Include allowedModel in response
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id; // Admin ID from authenticated user

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Verify that this user belongs to the admin
    if (user.adminId.toString() !== adminId.toString()) {
      return res.status(403).json({ 
        message: "You can only delete your own users" 
      });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);
 await AdminDashboard.findOneAndUpdate(
      { adminId: adminId },
      {
      $push: {
        recentActivity: {
        type: "user_Deleted",
        user: user.fullName,
        status: "success",
        time: new Date().toDateString(),
        action: `User '${user.fullName}' deleted by admin`
        }
      }
      }
    );
    res.status(200).json({
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Export users data


// Reset user password


export const getDashboardData = async (req, res) => {
  try {
    // Get the admin ID from the authenticated user
    const adminId = req.user.id;
    console.log("Fetching dashboard data for admin:", adminId);
    // Find the dashboard data for this admin
    const dashboardData = await AdminDashboard.findOne({ adminId })
      .lean()
      .exec();

    if (!dashboardData) {
      console.log("hii")
      return res.status(404).json({ 
        success: false,
        message: 'Dashboard data not found for this admin' 
      });
    }
    console.log("Dashboard data fetched for admin:", dashboardData);
    // Return the dashboard data
    res.status(200).json({
      success: true,
      data:dashboardData });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message 
    });
  }
};