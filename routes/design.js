import express from 'express';
import upload from '../middleware/uploadMeasurmentMiddleware.js';
import { getDesigns, createDesign, updateDesignItem, deleteDesignItem } from '../controller/designController.js';

const router = express.Router();


//Get Design by projectId
router.get('/project/:projectId', getDesigns);
// Create design with up to 50 items; files arrays must match item order
router.post('/', upload.fields([
  { name: 'imageFiles', maxCount: 50 },
  { name: 'designFiles', maxCount: 50 }
]), createDesign);

// Update single item (name and/or files)
router.patch('/:designId/items/:itemId', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'design', maxCount: 1 }
]), updateDesignItem);

// Delete single item
router.delete('/:designId/items/:itemId', deleteDesignItem);

export default router;
