import express from 'express';

import { getDesigns, createDesign, updateDesignItem, deleteDesignItem } from '../controller/designController.js';

const router = express.Router();


//Get Design by projectId
router.get('/:projectId', getDesigns);
// Create design with items containing imageLink and designLink from S3
router.post('/', createDesign);

// Update single item (name, imageLink, designLink)
router.patch('/:designId/items/:itemId', updateDesignItem);

// Delete single item
router.delete('/:designId/items/:itemId', deleteDesignItem);

export default router;
