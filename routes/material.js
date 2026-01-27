import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  deleteAllMaterials,
} from '../controller/materialController.js';

const router = express.Router();

// GET: Fetch all materials for a project
router.get('/:projectId', getMaterials);

// POST: Create/add a material item (with optional image upload)
router.post('/:projectId', upload.single('image'), createMaterial);

// PATCH: Update a specific material item (with optional image upload)
router.patch('/:projectId/:materialId', upload.single('image'), updateMaterial);

// DELETE: Delete a specific material item
router.delete('/:projectId/:materialId', deleteMaterial);

// DELETE: Delete all materials for a project
router.delete('/:projectId', deleteAllMaterials);

export default router;
