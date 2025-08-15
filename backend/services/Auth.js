// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/AdminModel.js";
import UserModel from "../models/UserModel.js";


export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt with username:", username);

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    let foundUser = null;
    let userCollection = null;

    // Check in Admin collection
    foundUser = await Admin.findOne({ username });
    if (foundUser) {
      userCollection = "Admin";
    } else {
      // If not found in Admin, check in User collection
      foundUser = await UserModel.findOne({ email:username });
      if (foundUser) {
        userCollection = "User";
      }
    }
    console.log("Found user:", foundUser);
    // If user not found
    if (!foundUser) {
      return res.status(404).json({ message: "Invalid username or password" });
    }

    // Check if user is active (only for User collection, assuming Admin is always active)
    if (userCollection === "User" && !foundUser.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Please contact administrator." });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Update lastLogin timestamp for User collection
    if (userCollection === "User") {
      await User.findByIdAndUpdate(
        foundUser._id,
        { lastLogin: new Date() },
        { new: true }
      );
      // Update the foundUser object to reflect the new lastLogin
      foundUser.lastLogin = new Date();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: foundUser._id, role: foundUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return token and user info (excluding password)
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: foundUser._id,
        username: foundUser.username,
        role: foundUser.role,
        ...(userCollection === "User" && {
          email: foundUser.email,
          fullName: foundUser.fullName,
          isActive: foundUser.isActive,
          lastLogin: foundUser.lastLogin
        })
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};