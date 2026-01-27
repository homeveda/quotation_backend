import ProjectInspection from "../model/inspectionModel.js";
import Project from "../model/projectModel.js";
import fs from "fs";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/aws.js";

const uploadVideoToS3 = async (file, projectId) => {
    if (!file) return null;
    const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
    const filename = `${Date.now()}-${file.originalname}`.replace(/\s+/g, "_");
    const key = `projects/${projectId}/inspection/${filename}`;
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

        const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        return fileUrl;
    } catch (err) {
        console.log('Failed to upload to S3:', err);
        return err;
    }
};

const deleteFileFromS3 = async (fileUrl) => {
    if (!fileUrl) return;
    try {
        const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
        let key;
        if (fileUrl.includes('.amazonaws.com/')) {
            key = decodeURIComponent(fileUrl.split('.amazonaws.com/')[1]);
        } else {
            // fallback to parsing path
            try {
                const u = new URL(fileUrl);
                key = decodeURIComponent(u.pathname.slice(1));
            } catch (e) {
                return;
            }
        }
        if (!key) return;
        const params = { Bucket: bucket, Key: key };
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
    } catch (err) {
        console.log('Failed to delete from S3:', err);
    }
};

// GET: retrieve inspections for a project
const getInspections = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId) {
            return res.status(400).json({ message: "projectId is required" });
        }

        const inspections = await ProjectInspection.find({ projectId });
        res.status(200).json({ success: true, inspections });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET: retrieve a specific inspection
const getInspectionById = async (req, res) => {
    try {
        const { inspectionId } = req.params;
        if (!inspectionId) {
            return res.status(400).json({ message: "inspectionId is required" });
        }

        const inspection = await ProjectInspection.findById(inspectionId);
        if (!inspection) {
            return res.status(404).json({ message: "Inspection not found" });
        }

        res.status(200).json({ success: true, inspection });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// POST: create a new inspection
const createInspection = async (req, res) => {
    try {
        const { 
            projectId, 
            inspectionDate, 
            plumbingStatus, 
            electricityStatus, 
            chimneyPointStatus,
            falseCeilingStatus,
            flooringStatus,
            readyForNextPhase
        } = req.body;

        if (!projectId) {
            return res.status(400).json({ message: "projectId is required" });
        }

        // Verify project exists
        const projectExists = await Project.findOne({ id: projectId });
        if (!projectExists) {
            return res.status(400).json({ message: "Invalid projectId" });
        }

        // Upload files to S3
        let plumbingVideoUrl = null;
        let electricityVideoUrl = null;
        let chimneyPointVideoUrl = null;
        let falseCeilingVideoUrl = null;
        let flooringVideoUrl = null;
        let otherVideosUrls = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.fieldname === "plumbingVideo") {
                    plumbingVideoUrl = await uploadVideoToS3(file, projectId);
                } else if (file.fieldname === "electricityVideo") {
                    electricityVideoUrl = await uploadVideoToS3(file, projectId);
                } else if (file.fieldname === "chimneyPointVideo") {
                    chimneyPointVideoUrl = await uploadVideoToS3(file, projectId);
                } else if (file.fieldname === "falseCeilingVideo") {
                    falseCeilingVideoUrl = await uploadVideoToS3(file, projectId);
                } else if (file.fieldname === "flooringVideo") {
                    flooringVideoUrl = await uploadVideoToS3(file, projectId);
                } else if (file.fieldname === "otherVideos") {
                    const url = await uploadVideoToS3(file, projectId);
                    if (url && typeof url === 'string') {
                        otherVideosUrls.push(url);
                    }
                }
            }
        }

        // Create inspection document
        const inspection = await ProjectInspection.create({
            projectId,
            inspectionDate: inspectionDate || new Date(),
            plumbingStatus: plumbingStatus || "Pending",
            plumbingVideo: plumbingVideoUrl,
            electricityStatus: electricityStatus || "Pending",
            electricityVideo: electricityVideoUrl,
            chimneyPointStatus: chimneyPointStatus || "Pending",
            chimneyPointVideo: chimneyPointVideoUrl,
            falseCeilingStatus: falseCeilingStatus || "Pending",
            falseCeilingVideo: falseCeilingVideoUrl,
            flooringStatus: flooringStatus || "Pending",
            flooringVideo: flooringVideoUrl,
            otherVideos: otherVideosUrls,
            readyForNextPhase: readyForNextPhase || false,
        });

        return res.status(201).json({ success: true, inspection });
    } catch (err) {
        console.error("Create Inspection Error:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};

// PATCH: update an inspection
const updateInspection = async (req, res) => {
    try {
        const { inspectionId } = req.params;
        if (!inspectionId) {
            return res.status(400).json({ message: "inspectionId is required" });
        }

        const inspection = await ProjectInspection.findById(inspectionId);
        if (!inspection) {
            return res.status(404).json({ message: "Inspection not found" });
        }

        const { 
            inspectionDate, 
            plumbingStatus, 
            electricityStatus, 
            chimneyPointStatus,
            falseCeilingStatus,
            flooringStatus,
            readyForNextPhase
        } = req.body;

        // Update basic fields
        if (inspectionDate) inspection.inspectionDate = inspectionDate;
        if (plumbingStatus) inspection.plumbingStatus = plumbingStatus;
        if (electricityStatus) inspection.electricityStatus = electricityStatus;
        if (chimneyPointStatus) inspection.chimneyPointStatus = chimneyPointStatus;
        if (falseCeilingStatus) inspection.falseCeilingStatus = falseCeilingStatus;
        if (flooringStatus) inspection.flooringStatus = flooringStatus;
        if (readyForNextPhase !== undefined) inspection.readyForNextPhase = readyForNextPhase;
        // Handle file updates
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.fieldname === "plumbingVideo") {
                    if (inspection.plumbingVideo) {
                        await deleteFileFromS3(inspection.plumbingVideo);
                    }
                    const url = await uploadVideoToS3(file, inspection.projectId);
                    if (typeof url === 'string') {
                        inspection.plumbingVideo = url;
                    }
                } else if (file.fieldname === "electricityVideo") {
                    if (inspection.electricityVideo) {
                        await deleteFileFromS3(inspection.electricityVideo);
                    }
                    const url = await uploadVideoToS3(file, inspection.projectId);
                    if (typeof url === 'string') {
                        inspection.electricityVideo = url;
                    }
                } else if (file.fieldname === "chimneyPointVideo") {
                    if (inspection.chimneyPointVideo) {
                        await deleteFileFromS3(inspection.chimneyPointVideo);
                    }
                    const url = await uploadVideoToS3(file, inspection.projectId);
                    if (typeof url === 'string') {
                        inspection.chimneyPointVideo = url;
                    }
                } else if (file.fieldname === "falseCeilingVideo") {
                    if (inspection.falseCeilingVideo) {
                        await deleteFileFromS3(inspection.falseCeilingVideo);
                    }
                    const url = await uploadVideoToS3(file, inspection.projectId);
                    if (typeof url === 'string') {
                        inspection.falseCeilingVideo = url;
                    }
                } else if (file.fieldname === "flooringVideo") {
                    if (inspection.flooringVideo) {
                        await deleteFileFromS3(inspection.flooringVideo);
                    }
                    const url = await uploadVideoToS3(file, inspection.projectId);
                    if (typeof url === 'string') {
                        inspection.flooringVideo = url;
                    }
                } else if (file.fieldname === "otherVideos") {
                    const url = await uploadVideoToS3(file, inspection.projectId);
                    if (url && typeof url === 'string') {
                        inspection.otherVideos.push(url);
                    }
                }
            }
        }

        await inspection.save();
        return res.status(200).json({ success: true, inspection });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

// DELETE: delete an inspection and its S3 files
const deleteInspection = async (req, res) => {
    try {
        const { inspectionId } = req.params;
        if (!inspectionId) {
            return res.status(400).json({ message: "inspectionId is required" });
        }

        const inspection = await ProjectInspection.findById(inspectionId);
        if (!inspection) {
            return res.status(404).json({ message: "Inspection not found" });
        }

        // Delete all S3 files (best effort)
        if (inspection.plumbingVideo) {
            await deleteFileFromS3(inspection.plumbingVideo);
        }
        if (inspection.electricityVideo) {
            await deleteFileFromS3(inspection.electricityVideo);
        }
        if (inspection.chimneyPointVideo) {
            await deleteFileFromS3(inspection.chimneyPointVideo);
        }
        if (inspection.falseCeilingVideo) {
            await deleteFileFromS3(inspection.falseCeilingVideo);
        }
        if (inspection.flooringVideo) {
            await deleteFileFromS3(inspection.flooringVideo);
        }
        if (inspection.otherVideos && inspection.otherVideos.length > 0) {
            for (const videoUrl of inspection.otherVideos) {
                await deleteFileFromS3(videoUrl);
            }
        }

        await ProjectInspection.findByIdAndDelete(inspectionId);
        return res.status(200).json({ success: true, message: "Inspection deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

// DELETE: remove a single video from otherVideos array
const deleteOtherVideo = async (req, res) => {
    try {
        const { inspectionId, videoIndex } = req.params;
        if (!inspectionId || videoIndex === undefined) {
            return res.status(400).json({ message: "inspectionId and videoIndex are required" });
        }

        const inspection = await ProjectInspection.findById(inspectionId);
        if (!inspection) {
            return res.status(404).json({ message: "Inspection not found" });
        }

        const index = parseInt(videoIndex, 10);
        if (index < 0 || index >= inspection.otherVideos.length) {
            return res.status(400).json({ message: "Invalid video index" });
        }

        const videoUrl = inspection.otherVideos[index];
        await deleteFileFromS3(videoUrl);
        inspection.otherVideos.splice(index, 1);

        await inspection.save();
        return res.status(200).json({ success: true, message: "Video deleted", inspection });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

export { getInspections, getInspectionById, createInspection, updateInspection, deleteInspection, deleteOtherVideo };
