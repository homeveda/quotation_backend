import express from 'express';
import cors from 'cors';
import connectDB  from './config/mongo.js';

import dotenv from 'dotenv';
dotenv.config();

import userRouter from './routes/user.js';
import projectRouter from './routes/project.js';

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
connectDB();

app.use(express.json());

app.use('/user', userRouter);
app.use('/project',projectRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
