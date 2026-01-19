import express from 'express';
import upload from '../middleware/uploadMeasurmentMiddleware.js';
import {
    getInspections,
    getInspectionById,
    createInspection,
    updateInspection,
    deleteInspection,
    deleteOtherVideo
} from '../controller/projectInspeetionController.js';

const router = express.Router();

// GET: retrieve all inspections for a project
router.get('/:projectId', getInspections);

// GET: retrieve a specific inspection by ID
router.get('/details/:inspectionId', getInspectionById);

// POST: create a new inspection with video uploads
router.post('/', upload.any(), createInspection);

// PATCH: update an inspection (status, date, and/or video files)
router.patch('/:inspectionId', upload.any(), updateInspection);

// DELETE: delete an entire inspection and all its videos
router.delete('/:inspectionId', deleteInspection);

// DELETE: remove a single video from otherVideos array by index
router.delete('/:inspectionId/videos/:videoIndex', deleteOtherVideo);

export default router;
