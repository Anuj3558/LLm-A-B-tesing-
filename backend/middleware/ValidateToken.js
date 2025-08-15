// controllers/authController.js
import jwt from "jsonwebtoken";
import Admin from "../models/AdminModel.js";
import User from "../models/UserModel.js";

// Validate Token Function
export const validateToken = async (req, res, next) => {
  try {
    // Get token from header
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: "Access denied. No token provided." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Extract user info from token
    const userId = decoded?.id;
    const userRole = decoded?.role;
    
    let currentUser = null;
     
    // Find user based on role
    if (userRole === "admin") {
      currentUser = await Admin.findById(userId).select('-password');
      
    } else if (userRole === "user") {
      currentUser = await User.findById(userId).select('-password');
      
      // Check if user is still active
      if (currentUser && !currentUser.isActive) {
        return res.status(403).json({ 
          message: "Account is deactivated. Please contact administrator." 
        });
      }
    }

    // Check if user exists
    if (!currentUser) {
      return res.status(401).json({ 
        message: "Invalid token. User not found." 
      });
    }

    // Set current user in request object
    req.user = {
      id: currentUser._id,
      username: currentUser.username,
      role: currentUser.role,
      ...(userRole === "user" && {
        email: currentUser.email,
        fullName: currentUser.fullName,
        isActive: currentUser.isActive,
        adminId: currentUser.adminId
      })
    };

    // If used as middleware, continue to next function
    if (next) {
      return next();
    }
     
    // If used as controller, return user info
    res.status(200).json({
      message: "Token is valid",
      user: req.user
    });

  } catch (error) {
    console.error("Token validation error:", error);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        message: "Invalid token format." 
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token has expired. Please login again." 
      });
    }

    if (error.name === "NotBeforeError") {
      return res.status(401).json({ 
        message: "Token is not active yet." 
      });
    }

    res.status(500).json({ 
      message: "Server error during token validation", 
      error: error.message 
    });
  }
};