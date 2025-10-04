import { Router } from "express";
const userRouter = Router();
import { registerUser, registerAdmin, changePassword, updateUserDetails, forgotPassword, deleteUser, getAllUsers, loginUser, resetPassword } from "../controller/userController.js";

userRouter.post('/', registerUser);

userRouter.post('/admin', registerAdmin);

userRouter.post('/change-password', changePassword);

userRouter.post('/login', loginUser);

userRouter.patch('/', updateUserDetails);

userRouter.delete('/', deleteUser);

userRouter.get('/all', getAllUsers);

userRouter.post('/forgot-password', forgotPassword);

userRouter.post('/reset-password/:token', resetPassword);

export default userRouter;