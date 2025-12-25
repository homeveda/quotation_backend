import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB  from './config/mongo.js';

import dotenv from 'dotenv';
dotenv.config();

import userRouter from './routes/user.js';
import projectRouter from './routes/project.js';
import catelogRouter from './routes/catelog.js';
import initialLeadRouter from './routes/initialLead.js';
import designRouter from "./routes/design.js";

import checkAdmin from './middleware/checkAdmin.js';

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/user', userRouter);
app.use('/project', projectRouter);
app.use('/designs', designRouter);
app.use('/catelog',checkAdmin, catelogRouter);
app.use('/initiallead',checkAdmin,initialLeadRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
