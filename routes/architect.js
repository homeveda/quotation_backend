import { Router } from "express";
import { createArchitect, getAllArchitects, getArchitectById, updateArchitect, deleteArchitect } from "../controller/architectController.js";

const router = Router();

// Get all architects
router.get("/", getAllArchitects);

// Get architect by ID
router.get("/:id", getArchitectById);

// Create new architect
router.post("/", createArchitect);

// Update architect by ID
router.patch("/:id", updateArchitect);

// Delete architect by ID
router.delete("/:id", deleteArchitect);

export default router;
