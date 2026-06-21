import { Router } from "express";
import {getAllInitalLeads,getInitialLeadById,createInitalLead,deleteInitialLead,updateInitialLead} from '../controller/initialLeadController.js';
const router = Router();
import checkAdmin from '../middleware/checkAdmin.js';
// Get all the inital lead details
router.get("/",checkAdmin,getAllInitalLeads);

// Get inital Lead By ID
router.get("/:id",checkAdmin,getInitialLeadById);

// Create New Inital Lead
router.post("/",checkAdmin,createInitalLead);

// Delete Inital Lead by ID
router.delete("/:id",checkAdmin,deleteInitialLead);

// Update Inital Lead By ID
router.patch("/:id",checkAdmin,updateInitialLead);

router.post("/req",createInitalLead);
export default router;