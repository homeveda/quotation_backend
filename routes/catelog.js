import {createCatelog, getAllCatelogs, getCatelogByName, deleteCatelog, updateCatelog,getCatelogByCategory,getCatelogByCategoryAndType,getCatelogByCategoryAndWorkType, getDepartments, getCatelogByDepartment, getCatelogByDepartmentAndWorkType, getCatelogGrouped} from '../controller/categlogController.js'

import { Router } from "express";
import { catelogUpload } from '../middleware/uploadMiddleware.js';

const catelogRouter = Router();

// Get department -> workType mapping (for frontend dropdowns)
catelogRouter.get('/departments', getDepartments);
// Get catelogs grouped by department -> workType
catelogRouter.get('/grouped', getCatelogGrouped);
// Create catelog (accepts fields and files: image, video)
catelogRouter.post('/', catelogUpload, createCatelog);
// Get all catelogs
catelogRouter.get('/', getAllCatelogs);
// Get catelogs by department and workType
catelogRouter.get('/department/:department/workType/:workType', getCatelogByDepartmentAndWorkType);
// Get catelogs by department
catelogRouter.get('/department/:department', getCatelogByDepartment);
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