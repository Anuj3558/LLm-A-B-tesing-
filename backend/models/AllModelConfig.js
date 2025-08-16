// models/GlobalConfig.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const AllModels = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
      // simple URL pattern; tweak as needed
      match: /^https?:\/\/.+/i,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent duplicate configs per provider by name
AllModels.index({ name: 1, provider: 1 }, { unique: true });

// Optional: normalize endpoint (remove trailing slash)
AllModels.pre("save", function (next) {
  if (this.endpoint && this.endpoint.length > 1 && this.endpoint.endsWith("/")) {
    this.endpoint = this.endpoint.replace(/\/+$/, "");
  }
  next();
});

const AllModelsConfig = model("AllModels", AllModels);
export default AllModelsConfig;
