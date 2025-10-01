import express from 'express';
import cors from 'cors';
import connectDB  from './config/mongo.js';

import dotenv from 'dotenv';
dotenv.config();

import userRouter from './routes/user.js';

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
connectDB();

app.use(express.json());

app.use('/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
