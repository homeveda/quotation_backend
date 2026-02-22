import mongoose,{ Schema } from "mongoose";
import { ALL_ROLES } from "../constants/roles.js";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ALL_ROLES,
    default: 'user',
  },
  resetToken:{
    type: String,
  },
  resetTokenExpiry:{
    type: Date,
  }
}, { timestamps: true });

const User = new mongoose.model("User", userSchema);

export default User;
