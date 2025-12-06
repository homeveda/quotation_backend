import Project from "../model/projectModel.js";
import { v4 as UUIDV4} from 'uuid';
const getProjectsOfUser = async (req, res) => {
    try {
        // Expect userEmail as query param: /user?userEmail=foo@x.com
        const userEmail = req.query.userEmail;
        if (!userEmail) return res.status(400).json({ message: "userEmail query param is required" });
        const projects = await Project.find({ userEmail });
        res.status(200).json({ projects });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const getProjectDetails = async(req,res)=>{
    try{
        // id comes from route param
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Project id is required" });
        const details = await Project.findOne({ id });
        if (!details) return res.status(404).json({ message: "Project not found" });
        res.status(200).json({details});
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
}

// Helper to safely parse JSON fields coming from multipart/form-data
const parseJSONField = (field) => {
    if (field === undefined) return undefined;
    if (typeof field !== 'string') return field;
    const trimmed = field.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try { return JSON.parse(trimmed); } catch (e) { return field; }
    }
    return field;
}

const createProject = async (req, res) => {
    try {
        // multipart requests can send JSON fields as strings, parse safely
        const { userEmail: rawUserEmail, architectName, category, projectHead } = req.body;
        let kitchen = parseJSONField(req.body.kitchen);
        let wardrobe = parseJSONField(req.body.wardrobe);
        const userEmail = rawUserEmail;
        const id = UUIDV4();
        // Enforce that a project has exactly one of `kitchen` or `wardrobe`
        if (kitchen && wardrobe) {
            return res.status(400).json({ message: "A project can have only one of 'kitchen' or 'wardrobe'" });
        }
        if (!kitchen && !wardrobe) {
            return res.status(400).json({ message: "Either 'kitchen' or 'wardrobe' is required" });
        }

        // Validate required fields early
        if (!userEmail) return res.status(400).json({ message: "userEmail is required" });
        if (!projectHead) return res.status(400).json({ message: "projectHead is required" });

        const projectData = { id, userEmail, architectName, category, projectHead };
        if (kitchen) projectData.kitchen = kitchen;
        if (wardrobe) projectData.wardrobe = wardrobe;

        const newProject = new Project(projectData);
        await newProject.save();
        res.status(201).json({ message: "Project created successfully", project: newProject });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateProject = async (req, res) => {
    try {
        // id comes from route param
        const { id } = req.params;
        const { architectName, category } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Project id is required" });
        }

        const project = await Project.findOne({ id });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        // Only allow updating specific fields
        if (architectName !== undefined) project.architectName = architectName;
        // Support updating category, kitchen, and wardrobe while keeping the invariant
        let kitchen = parseJSONField(req.body.kitchen);
        let wardrobe = parseJSONField(req.body.wardrobe);

        if (category !== undefined) {
            const allowed = ["Builder", "Economy", "Standard", "VedaX"];
            if (!allowed.includes(category)) {
                return res.status(400).json({ message: "Invalid category" });
            }
            project.category = category;
        }
        // If both kitchen and wardrobe provided in update, reject
        if (kitchen && wardrobe) {
            return res.status(400).json({ message: "A project can have only one of 'kitchen' or 'wardrobe'" });
        }
        // If kitchen provided, set kitchen and remove wardrobe
        if (kitchen !== undefined) {
            if (kitchen === null) {
                project.kitchen = undefined;
            } else {
                project.kitchen = kitchen;
            }
            project.wardrobe = undefined;
        }

        // If wardrobe provided, set wardrobe and remove kitchen
        if (wardrobe !== undefined) {
            if (wardrobe === null) {
                project.wardrobe = undefined;
            } else {
                project.wardrobe = wardrobe;
            }
            project.kitchen = undefined;
        }

        // After updates ensure at least one of kitchen/wardrobe remains
        if (!project.kitchen && !project.wardrobe) {
            return res.status(400).json({ message: "Project must have either 'kitchen' or 'wardrobe'" });
        }

        await project.save();
        res.status(200).json({ message: "Project updated successfully", project });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteProject = async (req, res) => {
    try {
        // id comes from route param
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Project id is required" });
        }
        const deleted = await Project.findOneAndDelete({ id });
        if (!deleted) {
            return res.status(404).json({ message: "Project not found or you don't have permission to delete it" });
        }

        res.status(200).json({ message: "Project deleted successfully", project: deleted });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export { getProjectsOfUser, createProject, updateProject, getProjectDetails, deleteProject };