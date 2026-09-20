import express from 'express';

import {
  getOrders,
  createOrder,
  deleteOrder,
  deleteAllOrders,
} from '../controller/orderController.js';

const router = express.Router();

// GET: Fetch all order files for a project
router.get('/:projectId', getOrders);

// POST: Create order records from frontend-uploaded S3 URLs
router.post('/:projectId', createOrder);

// DELETE: Delete a specific order file
router.delete('/:projectId/:itemId', deleteOrder);

// DELETE: Delete all order files for a project
router.delete('/:projectId', deleteAllOrders);

export default router;
