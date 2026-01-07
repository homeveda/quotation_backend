import { Router } from "express";
import { getQuotations, createQuotation, updateQuotation, deleteQuotation } from "../controller/quotationController.js";
import checkAdmin from '../middleware/checkAdmin.js';
const router = Router();

router.get('/:projectId', getQuotations);

router.post('/',checkAdmin, createQuotation);

router.patch('/:quotationId', checkAdmin, updateQuotation);

router.delete('/:quotationId', checkAdmin, deleteQuotation);

export default router;
