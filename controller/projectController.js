import Project from "../model/projectModel";
import { v4 as UUIDV4} from 'uuid';
const getProjectsOfUser = async (req, res) => {
    try {
        const {userEmail} = req.body;
        const projects = await Project.find({userEmail});
        res.status(200).json({ projects });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const getProjectDetails = async(req,res)=>{
    try{
        const {id} = req.body;
        const details = await Project.find({id});
        res.status(200).json({details});
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
}

const createProject = async (req, res) => {
    try {
        const { userEmail, architectName, category } = req.body;
        const id = UUIDV4();
        const newProject = new Project({
            id,
            userEmail,
            architectName,
            category
        });
        await newProject.save();
        res.status(201).json({ message: "Project created successfully", project: newProject });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateProject = async (req, res) => {
    try {
        const { id, architectName, category } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Project id is required" });
        }

        const project = await Project.findOne({ id });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Only allow updating specific fields
        if (architectName !== undefined) project.architectName = architectName;
        if (category !== undefined) {
            const allowed = ["Builder", "Economy", "Standard", "VedaX"];
            if (!allowed.includes(category)) {
                return res.status(400).json({ message: "Invalid category" });
            }
            project.category = category;
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
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Project id is required" });
        }

        

        const deleted = await Project.findOneAndDelete(query);
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