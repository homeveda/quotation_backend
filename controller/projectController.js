import Project from "../model/projectModel.js";
import { v4 as UUIDV4} from 'uuid';
import { PutObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/aws.js";

const uploadFile = async (file, projectid) => {
  if (!file) return null;
  const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
  const filename = `${Date.now()}-${file.originalname}`.replace(/\s+/g, "_");
  const key = `projects/${projectid}/plan/${filename}`;
  const Body = file.buffer ? file.buffer : fs.createReadStream(file.path);

  const params = {
    Bucket: bucket,
    Key: key,
    Body,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);

    // Construct file URL manually
    const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log("✅ File uploaded successfully:", fileUrl);
    return fileUrl;
  } catch (err) {
    console.error("❌ File upload failed:", err);
    throw err;
  }
};

const deleteS3Object = async (key) => {
  if (!key) return { key, ok: false, error: "No key provided" };
  
  // Decode the key in case it's URL-encoded
  const decodedKey = decodeURIComponent(key);
  
  const Bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
  const params = { Bucket, Key: decodedKey };
  const cmd = new DeleteObjectCommand(params);
  
  try {
    const response = await s3.send(cmd);
    console.log("✅ S3 object deleted successfully:", decodedKey);
    return { key: decodedKey, ok: true, response };
  } catch (err) {
    console.error("❌ S3 delete failed:", err);
    return { key: decodedKey, ok: false, error: err.message || String(err) };
  }
};

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
        const { userEmail: rawUserEmail, architectName, category, projectHead, status } = req.body;
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
                // optional status with enum validation
                if (status !== undefined) {
                        const allowedStatus = [
                            "LEAD","DESIGN","QUOTATION","10% TOKEN","FINAL MEASUREMENT","FINAL DRAWINGS",
                            "50% PAYMENT","FACTORY ORDER","SITE READY CHECK","FACTORY FULL PAYMENT","DISPATCH",
                            "90% CLIENT PAYMENT","INSTALLATION","QUALITY CHECK","HANDOVER","10% FINAL PAYMENT","AFTER SALES"
                        ];
                        if (!allowedStatus.includes(status)) {
                                return res.status(400).json({ message: "Invalid status" });
                        }
                        projectData.status = status;
                }
        if (kitchen) projectData.kitchen = kitchen;
        if (wardrobe) projectData.wardrobe = wardrobe;

        // If files are uploaded (multer memoryStorage), upload to S3
        console.log("Files received:", req.files);
        if (req.files && req.files.length > 0) {
            const uploadedUrls = [];
            for (const file of req.files) {
                try {
                    const fileUrl = await uploadFile(file, id);
                    uploadedUrls.push(fileUrl);
                } catch (uploadErr) {
                    console.error("❌ Failed to upload file:", uploadErr);
                    return res.status(500).json({ message: "File upload to S3 failed", error: uploadErr.message });
                }
            }
            // attach files to appropriate field: if kitchen exists use kitchen.layoutPlan else wardrobe.measureents
            if (kitchen) {
                projectData.kitchen = projectData.kitchen || {};
                projectData.kitchen.layoutPlan = uploadedUrls;
            } else if (wardrobe) {
                projectData.wardrobe = projectData.wardrobe || {};
                projectData.wardrobe.measureents = uploadedUrls;
            }
        }

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
        const { architectName, category, status } = req.body;

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
        // Status update if provided
        if (status !== undefined) {
            const allowedStatus = [
              "LEAD","DESIGN","QUOTATION","10% TOKEN","FINAL MEASUREMENT","FINAL DRAWINGS",
              "50% PAYMENT","FACTORY ORDER","SITE READY CHECK","FACTORY FULL PAYMENT","DISPATCH",
              "90% CLIENT PAYMENT","INSTALLATION","QUALITY CHECK","HANDOVER","10% FINAL PAYMENT","AFTER SALES"
            ];
            if (!allowedStatus.includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }
            project.status = status;
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

        // Support removing existing files, optionally replacing, or merging uploads
        // Accept both `removeFiles` and `removedFiles` from clients
        let removeFiles = parseJSONField(
            req.body.removeFiles !== undefined ? req.body.removeFiles : req.body.removedFiles
        );
        const replaceFilesFlag = req.body.replaceFiles === 'true' || req.body.replaceFiles === true;

        // Determine which field (kitchen or wardrobe) we're targeting for files
        let target = null;
        if (kitchen !== undefined) target = 'kitchen';
        else if (wardrobe !== undefined) target = 'wardrobe';
        else if (project.kitchen) target = 'kitchen';
        else if (project.wardrobe) target = 'wardrobe';

        // Collect existing files for the target field
        let existingFiles = [];
        if (target === 'kitchen' && project.kitchen && Array.isArray(project.kitchen.layoutPlan)) {
            existingFiles = [...project.kitchen.layoutPlan];
        } else if (target === 'wardrobe' && project.wardrobe && Array.isArray(project.wardrobe.measureents)) {
            existingFiles = [...project.wardrobe.measureents];
        }

        // Prepare bucket and urlPattern for S3 key extraction
        const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
        const urlPattern = new RegExp(`https://${bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`);

        // If replaceFilesFlag is true, delete all existing files for the target from S3
        if (replaceFilesFlag && existingFiles.length > 0) {
            for (const fileUrl of existingFiles) {
                try {
                    const match = typeof fileUrl === 'string' ? fileUrl.match(urlPattern) : null;
                    if (match && match[1]) {
                        await deleteS3Object(match[1]);
                    }
                } catch (delErr) {
                    console.error('❌ Failed to delete existing file from S3 during replace:', delErr);
                }
            }
            // clear existingFiles as we've removed them
            existingFiles = [];
        }

        // If removeFiles provided, delete them from S3 and remove from existingFiles
        if (Array.isArray(removeFiles) && removeFiles.length > 0) {
            for (const fileUrl of removeFiles) {
                try {
                    const match = typeof fileUrl === 'string' ? fileUrl.match(urlPattern) : null;
                    if (match && match[1]) {
                        await deleteS3Object(match[1]);
                    }
                } catch (delErr) {
                    console.error('❌ Failed to delete requested file from S3:', delErr);
                }
            }
            // Filter out the removed URLs from existingFiles
            existingFiles = existingFiles.filter(url => !removeFiles.includes(url));
        }

        // If files uploaded, upload to S3
        const uploadedUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const fileUrl = await uploadFile(file, id);
                    uploadedUrls.push(fileUrl);
                } catch (uploadErr) {
                    console.error("❌ Failed to upload file:", uploadErr);
                    return res.status(500).json({ message: "File upload to S3 failed", error: uploadErr.message });
                }
            }
        }

        // Compute final file list depending on replace flag
        let finalFiles = [];
        if (replaceFilesFlag) {
            finalFiles = uploadedUrls;
        } else {
            finalFiles = [...existingFiles, ...uploadedUrls];
        }

        // Attach finalFiles to appropriate field if we have a target
        if (target === 'kitchen') {
            project.kitchen = project.kitchen || {};
            if (finalFiles.length > 0) project.kitchen.layoutPlan = finalFiles;
            else project.kitchen.layoutPlan = project.kitchen.layoutPlan ? [] : undefined;
        }
        if (target === 'wardrobe') {
            project.wardrobe = project.wardrobe || {};
            if (finalFiles.length > 0) project.wardrobe.measureents = finalFiles;
            else project.wardrobe.measureents = project.wardrobe.measureents ? [] : undefined;
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

        // Find the project first to get file URLs
        const project = await Project.findOne({ id });
        if (!project) {
            return res.status(404).json({ message: "Project not found or you don't have permission to delete it" });
        }

        // Extract all file URLs from the project
        const fileUrls = [];
        if (project.kitchen && project.kitchen.layoutPlan && Array.isArray(project.kitchen.layoutPlan)) {
            fileUrls.push(...project.kitchen.layoutPlan);
        }
        if (project.wardrobe && project.wardrobe.measureents && Array.isArray(project.wardrobe.measureents)) {
            fileUrls.push(...project.wardrobe.measureents);
        }

        // Delete all files from S3
        if (fileUrls.length > 0) {
            const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
            const urlPattern = new RegExp(`https://${bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`);
            
            for (const fileUrl of fileUrls) {
                const match = fileUrl.match(urlPattern);
                if (match && match[1]) {
                    const key = match[1];
                    await deleteS3Object(key);
                }
            }
        }

        // Now delete the project from database
        const deleted = await Project.findOneAndDelete({ id });
        res.status(200).json({ message: "Project and all associated files deleted successfully", project: deleted });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteProjectFile = async (req, res) => {
    try {
        const { fileUrl } = req.body;
        if (!fileUrl) {
            return res.status(400).json({ message: "fileUrl is required" });
        }

        // Extract the key from the S3 URL
        const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
        const urlPattern = new RegExp(`https://${bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`);
        const match = fileUrl.match(urlPattern);
        
        if (!match || !match[1]) {
            return res.status(400).json({ message: "Invalid S3 file URL" });
        }

        const key = match[1];
        const result = await deleteS3Object(key);
        
        if (!result.ok) {
            return res.status(500).json({ message: "Failed to delete file from S3", error: result.error });
        }

        res.status(200).json({ message: "File deleted successfully from S3" });
    } catch (err) {
        console.error("Error deleting file:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

export { getProjectsOfUser, createProject, updateProject, getProjectDetails, deleteProject, deleteProjectFile };