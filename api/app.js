import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB  from '../config/mongo.js';

import dotenv from 'dotenv';
dotenv.config();

import userRouter from '../routes/user.js';
import projectRouter from '../routes/project.js';
import catelogRouter from '../routes/catelog.js';
import initialLeadRouter from '../routes/initialLead.js';
import designRouter from "../routes/design.js";
import quotationRouter from "../routes/quotation.js";
import projectInspectionRouter from "../routes/inspection.js";
import materialRouter from "../routes/material.js";

import checkAdmin from '../middleware/checkAdmin.js';

const app = express();

app.use(cors());
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/user', userRouter);
app.use('/project', projectRouter);
app.use('/designs', checkAdmin, designRouter);
app.use('/catelog',checkAdmin, catelogRouter);
app.use('/initiallead',checkAdmin,initialLeadRouter);
app.use('/quotation', quotationRouter);
app.use('/inspections', projectInspectionRouter);
app.use('/materials', checkAdmin, materialRouter);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

export default app;
app.get('/', (req, res) => {
  res.json({ message: "API is Sexy" });
});