import bcrypt from "bcrypt";
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
            return res.status(409).json({ message: "User already exists" });
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
            return res.status(409).json({ message: "User already exists" });
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
        console.log(err);
        res.status(500).json({message: "Server Error"});
    }
};

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
        console.log(err);
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
        console.log(err);
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
        console.log(err);
        res.status(500).json({message: "Server Error"});
    }   
};


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
        console.log(err);
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
        console.log(err);
        res.status(500).json({message: "Server Error"});
    }
};

const getAllUsers = async(req,res)=>{
    try{
        const users = await User.find({});
        res.status(200).json({ users });
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Server Error"});
    }
};

//Node mailer transporter setup

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const forgotPassword = async(req,res)=>{
    try{
        const { email } = req.body;
        // Find user by email
        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({ message: "User not found" });
        }

        // Generating reset token for 15 minutes
        const token = jwt.sign({email:user.email}, process.env.JWT_SECRET || "defaultsecret", {expiresIn: '15min'} );

        // Store the token and its expiry in the database for single use
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 15*60*1000; // 15 minutes from now
        // Saving details in database
        await user.save();

        // Send email with reset link
        const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${token}`;
        // Mailing 
        const mail = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset - HomeVeda",
            html: `<p>You requested for password reset. Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 15 minutes.</p>`
        });

        res.status(200).json({message: "Password reset link sent to your email."});
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Server Error"});
    }
}

const resetPassword = async(req,res)=>{
    try{
        const { token } = req.params;
        const { newPassword } = req.body;

        const decode = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
        const user = await User.findOne({ email: decode.email, resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

        if(!user){
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();
        res.status(200).json({ message: "Password reset successfully" });
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Server Error"});
    }
}

const userDetails = async(req,res)=>{
    try{
        const { email } = req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Server Error"});
    }
}

export { registerUser, registerAdmin, getUserDetails, changePassword, updateUserDetails, forgotPassword, deleteUser, getAllUsers, loginUser, resetPassword, userDetails };