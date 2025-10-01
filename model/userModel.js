import { Schema } from "mongoose";

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
  resetToken:{
    type: String,
  },
  resetTokenExpiry:{
    type: Date,
  },
  timestamps: true,
  
});

const User = model("User", userSchema);

export default User;
