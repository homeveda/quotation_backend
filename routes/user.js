import { Router } from "express";
const userRouter = Router();
import { registerUser, registerAdmin, changePassword, updateUserDetails, userDetails, forgotPassword, deleteUser, getAllUsers, getAllAdmins, updateAdminRole, deleteAdmin, loginUser, loginAdmin, resetPassword } from "../controller/userController.js";
import checkAdmin from "../middleware/checkAdmin.js";
import checkSuperAdmin from "../middleware/checkSuperAdmin.js";

// Register user
userRouter.post('/', registerUser);
// Register admin
userRouter.post('/admin', registerAdmin);
// Change password
userRouter.post('/change-password', changePassword);
// Login user
userRouter.post('/login', loginUser);
// Update user details with email in body
userRouter.patch('/', updateUserDetails);
// Delete user with email in body
userRouter.delete('/', deleteUser);

// Send password reset link
userRouter.post('/forgot-password', forgotPassword);

// Reset password
userRouter.post('/reset-password/:token', resetPassword);

// Get user details
userRouter.get('/', userDetails);

// Get all users
userRouter.get('/all', getAllUsers);

// Get all admins (super admin only)
userRouter.get('/admins', checkSuperAdmin, getAllAdmins);

// Update admin role (super admin only)
userRouter.patch('/admins/:adminId/role', checkSuperAdmin, updateAdminRole);

// Delete admin (super admin only)
userRouter.delete('/admins/:adminId', checkSuperAdmin, deleteAdmin);

userRouter.post('/admin/login', loginAdmin);

export default userRouter;