const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: String,
  password: String, 
  verified: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model("User", userSchema);
