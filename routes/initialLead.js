import { Router } from "express";
import {getAllInitalLeads,getInitialLeadById,createInitalLead,deleteInitialLead,updateInitialLead} from '../controller/initialLeadController.js';
const router = Router();

// Get all the inital lead details
router.get("/",getAllInitalLeads);

// Get inital Lead By ID
router.get("/:id",getInitialLeadById);

// Create New Inital Lead
router.post("/",createInitalLead);

// Delete Inital Lead by ID
router.delete("/:id",deleteInitialLead);

// Update Inital Lead By ID
router.patch("/:id",updateInitialLead);

export default router;