import mongoose from "mongoose";

const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "admin",
      enum: ["admin"]
    }
  },
  { timestamps: true }
);

// Check if model already exists to prevent OverwriteModelError
const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;
