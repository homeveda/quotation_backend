import bcrypt from bcryptjs;
import User from "../model/userModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();


const registerUser = async (req, res) => {
     try{
        const { name, email, password, address, phone } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            address,
            phone
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    }catch(err){
        res.status(500).json({message: "Server Error"});
    }
};

const registerAdmin = async (req, res) => {
    try{
        const { name, email, password, phone } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new admin user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            isAdmin: true   
        });
        await newUser.save();
        res.status(201).json({ message: "Admin user registered successfully" });
    }catch(err){
        res.status(500).json({message: "Server Error"});
    }
}



const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || "defaultsecret",
            { expiresIn: "7d" }
        );
        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

const changePassword = async(req,res)=>{
    try{
        const { email, oldPassword, newPassword } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if(!isMatch){
            return res.status(400).json({ message: "Old password is incorrect" });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
    }catch(err){
        res.status(500).json({message: "Server Error"});
    }
}

const updateUserDetails = async(req,res)=>{
    try{
        const { email, name, address, phone } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        // Update user details
        user.name = name || user.name;
        user.address = address || user.address;
        user.phone = phone || user.phone;
        await user.save();
        res.status(200).json({ message: "User details updated successfully" });
    }catch(err){
        res.status(500).json({message: "Server Error"});
    }   
}   

const forgotPassword = async(req,res)=>{
    try{

    }catch(err){
        res.status(500).json({message: "Server Error"});
    }
}

const getUserDetails = async(req,res)=>{
    try{
        const { email } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    }catch(err){
        res.status(500).json({message: "Server Error"});
    }
};

const deleteUser = async(req,res)=>{
    try{
        const { email } = req.body;
        // Find user by email and delete
        const user = await User.findOneAndDelete({ email });
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    }catch(err){
        res.status(500).json({message: "Server Error"});
    }
};

const getAllUsers = async(req,res)=>{
    try{
        const users = await User.find({});
        res.status(200).json({ users });
    }catch(err){
        res.status(500).json({message: "Server Error"});
    }
};

export { registerUser, registerAdmin,getUserDetails, changePassword, updateUserDetails, forgotPassword, deleteUser, getAllUsers };