import {createCatelog, getAllCatelogs, getCatelogByName, deleteCatelog, updateCatelog,getCatelogByCategory,getCatelogByCategoryAndType,getCatelogByCategoryAndWorkType} from '../controller/categlogController.js'

import { Router } from "express";
import { catelogUpload } from '../middleware/uploadMiddleware.js';

const catelogRouter = Router();

// Create catelog (accepts fields and files: image, video)
catelogRouter.post('/', catelogUpload, createCatelog);
// Get all catelogs
catelogRouter.get('/', getAllCatelogs);
// Get catelogs by category and type (more specific routes first)
catelogRouter.get('/category/:category/type/:type', getCatelogByCategoryAndType);
// Get catelogs by category and workType
catelogRouter.get('/category/:category/workType/:workType', getCatelogByCategoryAndWorkType);
// Get catelogs by category (generic - last)
catelogRouter.get('/category/:category', getCatelogByCategory);
// Get catelog by name
catelogRouter.get('/:name', getCatelogByName);
// Delete catelog by name
catelogRouter.delete('/:name', deleteCatelog);
//Update catelog
catelogRouter.patch('/:name', catelogUpload, updateCatelog);
export default catelogRouter;