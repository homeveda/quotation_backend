import { Router } from "express";
const projectRouter = Router();
import uploadMesurments from "../middleware/uploadMeasurmentMiddleware.js";
import { getProjectsOfUser, createProject, updateProject, getProjectDetails, deleteProject } from "../controller/projectController.js";

// List projects for a user (query param `userEmail`)
projectRouter.get("/user", getProjectsOfUser);

// Get project details by id
projectRouter.get("/:id", getProjectDetails);

projectRouter.post("/",uploadMesurments.array('files',10), createProject);

projectRouter.patch("/:id",uploadMesurments.array('files',10), updateProject);

projectRouter.delete("/:id",deleteProject);

export default projectRouter;
