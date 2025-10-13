import { Router } from "express";
const projectRouter = Router();
import { getProjectsOfUser, createProject, updateProject, getProjectDetails, deleteProject } from "../controller/projectController";

projectRouter.get("/user", getProjectsOfUser);

projectRouter.get("/",getProjectDetails);

projectRouter.post("/",createProject);

projectRouter.patch("/",updateProject);

projectRouter.delete("/",deleteProject);

export default projectRouter;
