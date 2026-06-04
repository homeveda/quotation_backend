import express from 'express';
import { materialFileUpload } from '../middleware/uploadMiddleware.js';
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

// POST: Create/add a material item (with optional file upload: images, PDF, DOCS, XLSX)
router.post('/:projectId', materialFileUpload, createMaterial);

// PATCH: Update a specific material item (with optional file upload: images, PDF, DOCS, XLSX)
router.patch('/:projectId/:materialId', materialFileUpload, updateMaterial);

// DELETE: Delete a specific material item
router.delete('/:projectId/:materialId', deleteMaterial);

// DELETE: Delete all materials for a project
router.delete('/:projectId', deleteAllMaterials);

export default router;
