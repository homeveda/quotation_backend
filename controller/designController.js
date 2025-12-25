import Design from "../model/designModel.js";
import Project from "../model/projectModel.js";
import fs from "fs";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/aws.js";

const uploadImageToS3 = async (file, projectId) => {
    if(!file) return null;
    const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
    const filename = `${Date.now()}-${file.originalname}`.replace(/\s+/g, "_");
    const key = `${projectId}/designs/${filename}`;
    const Body = file.buffer ? file.buffer : fs.createReadStream(file.path);

    const params = {
        Bucket: bucket,
        Key: key,
        Body,
        ContentType: file.mimetype,
        ACL: "public-read",
    };

    try{
        const command = new PutObjectCommand(params);
        await s3.send(command);

        const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        return fileUrl;
    } catch (err) {
        return err;
    } 
}

const deleteFileFromS3 = async (fileUrl) => {
    if (!fileUrl) return;
    try {
        const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
        let key;
        if (fileUrl.includes('.amazonaws.com/')) {
            key = fileUrl.split('.amazonaws.com/')[1];
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
}

const getDesigns = async (req, res) => {
    try {
        const designs = await Design.find({ projectId: req.params.projectId });
        res.status(200).json({ designs });
    }catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const createDesign = async (req, res) => {
    try{
        const { projectId } = req.body;
        if (!projectId) return res.status(400).json({ message: "projectId is required" });
        // Verify project exists (use findById to match typical _id usage)
        const projectExists = await Project.findById(projectId);
        if (!projectExists) return res.status(400).json({ message: "Invalid projectId" });

        // Expect `items` in body as JSON string or array of objects with at least `name`.
        // Files expected as multipart fields: `imageFiles` (array) and `designFiles` (array)
        let itemsInput = [];
        if (req.body.items) {
            itemsInput = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
        } else if (req.body.names) {
            // support simple names array
            itemsInput = Array.isArray(req.body.names) ? req.body.names.map(n => ({ name: n })) : JSON.parse(req.body.names);
        } else {
            return res.status(400).json({ message: 'items (array) is required in body' });
        }

        if (!Array.isArray(itemsInput)) return res.status(400).json({ message: 'items must be an array' });
        if (itemsInput.length > 50) return res.status(400).json({ message: 'Maximum 50 items allowed' });

        const imageFiles = (req.files && req.files.imageFiles) || [];
        const designFiles = (req.files && req.files.designFiles) || [];

        // Build items with uploads
        const items = [];
        for (let i = 0; i < itemsInput.length; i++) {
            const input = itemsInput[i] || {};
            const item = { name: input.name || input.title || '' };
            const imageFile = imageFiles[i];
            const designFile = designFiles[i];
            if (imageFile) {
                const url = await uploadImageToS3(imageFile, projectId);
                item.imageLink = typeof url === 'string' ? url : null;
            }
            if (designFile) {
                const url = await uploadImageToS3(designFile, projectId);
                item.designLink = typeof url === 'string' ? url : null;
            }
            items.push(item);
        }

        const design = new Design({ projectId, items });
        await design.save();
        return res.status(201).json({ design });
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
}

// PATCH: update a single item within a design
const updateDesignItem = async (req, res) => {
    try {
        const { designId, itemId } = req.params;
        if (!designId || !itemId) return res.status(400).json({ message: 'designId and itemId required in params' });

        const design = await Design.findById(designId);
        if (!design) return res.status(404).json({ message: 'Design not found' });

        const item = design.items.id(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Update name if provided
        if (req.body.name) item.name = req.body.name;

        // Accept files as multipart fields `image` and `design` (single files)
        const imageFile = (req.files && req.files.image && req.files.image[0]) || null;
        const designFile = (req.files && req.files.design && req.files.design[0]) || null;

        if (imageFile) {
            // delete old file from S3 (best effort)
            if (item.imageLink) await deleteFileFromS3(item.imageLink);
            const url = await uploadImageToS3(imageFile, design.projectId || design._id.toString());
            item.imageLink = typeof url === 'string' ? url : item.imageLink;
        }
        if (designFile) {
            if (item.designLink) await deleteFileFromS3(item.designLink);
            const url = await uploadImageToS3(designFile, design.projectId || design._id.toString());
            item.designLink = typeof url === 'string' ? url : item.designLink;
        }

        await design.save();
        return res.status(200).json({ design });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Server Error' });
    }
}

// DELETE: remove a single item from a design and delete its S3 files
const deleteDesignItem = async (req, res) => {
    try {
        const { designId, itemId } = req.params;
        if (!designId || !itemId) return res.status(400).json({ message: 'designId and itemId required in params' });

        const design = await Design.findById(designId);
        if (!design) return res.status(404).json({ message: 'Design not found' });

        const item = design.items.id(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Delete S3 files (best effort)
        if (item.imageLink) await deleteFileFromS3(item.imageLink);
        if (item.designLink) await deleteFileFromS3(item.designLink);

        item.remove();
        await design.save();
        return res.status(200).json({ message: 'Item deleted', design });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Server Error' });
    }
}

export { getDesigns, createDesign, updateDesignItem, deleteDesignItem };