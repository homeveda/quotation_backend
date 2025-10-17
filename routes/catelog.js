import {createCatelog, getAllCatelogs, getCatelogByName, deleteCatelog} from '../controller/categlogController.js'

import { Router } from "express";
import { catelogUpload } from '../middleware/uploadMiddleware.js';

const catelogRouter = Router();

// Create catelog (accepts fields and files: image, video)
catelogRouter.post('/', catelogUpload, createCatelog);
// Get all catelogs
catelogRouter.get('/', getAllCatelogs);
// Get catelog by name
catelogRouter.get('/:name', getCatelogByName);
// Delete catelog by name
catelogRouter.delete('/:name', deleteCatelog);
export default catelogRouter;