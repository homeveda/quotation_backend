import { Router } from "express";
const userRouter = Router();
import { registerUser, registerAdmin, changePassword, updateUserDetails, forgotPassword, deleteUser, getAllUsers  } from "../controllers/user.js";

userRouter.post('/', registerUser);

userRouter.post('/admin', registerAdmin);

userRouter.post('/change-password', changePassword);

userRouter.post('/login', loginUser);

userRouter.patch('/', updateUserDetails);

userRouter.post('/forgot-password', forgotPassword);

userRouter.delete('/', deleteUser);

userRouter.get('/all', getAllUsers);

