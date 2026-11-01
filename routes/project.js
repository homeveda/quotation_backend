import { Router } from "express";
const projectRouter = Router();
import uploadMesurments from "../middleware/uploadMeasurmentMiddleware.js";
import { getProjectsOfUser, createProject, updateProject, getProjectDetails, deleteProject, toggleIsActive, getActiveProjects, getPresignedUploadUrl } from "../controller/projectController.js";

// List projects for a user (query param `userEmail`)
projectRouter.get("/user", getProjectsOfUser);

// Get all active projects
projectRouter.get("/active", getActiveProjects);

// Presigned URL for direct frontend→S3 uploads (must be before /:id)
projectRouter.post("/presign", getPresignedUploadUrl);

// Get project details by id
projectRouter.get("/:id", getProjectDetails);

projectRouter.post("/", uploadMesurments.array('files', 20), createProject);

projectRouter.patch("/:id", uploadMesurments.array('files', 20), updateProject);

// Toggle or set isActive — body: { isActive: true/false } (optional; omitting flips the value)
projectRouter.patch("/:id/active", toggleIsActive);

projectRouter.delete("/:id", deleteProject);

export default projectRouter;
