import express from 'express';
import { orderFileUpload } from '../middleware/uploadMiddleware.js';
import {
  getOrders,
  createOrder,
  deleteOrder,
  deleteAllOrders,
} from '../controller/orderController.js';

const router = express.Router();

// GET: Fetch all order files for a project
router.get('/:projectId', getOrders);

// POST: Upload order files (PDF, DOC, XLSX, images — up to 10 at once)
router.post('/:projectId', orderFileUpload, createOrder);

// DELETE: Delete a specific order file
router.delete('/:projectId/:itemId', deleteOrder);

// DELETE: Delete all order files for a project
router.delete('/:projectId', deleteAllOrders);

export default router;
