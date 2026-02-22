import Material from "../model/materialModel.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/aws.js";

// Upload image to S3
const uploadMaterialImage = async (file, projectId) => {
  if (!file) return null;
  const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
  const filename = `${Date.now()}-${file.originalname}`.replace(/\s+/g, "_");
  const key = `projects/${projectId}/material/${filename}`;

  const params = {
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION_HV}.amazonaws.com/${key}`;
    console.log("✅ Material image uploaded:", fileUrl);
    return fileUrl;
  } catch (err) {
    console.error("❌ Material image upload failed:", err);
    throw err;
  }
};

// Delete S3 object with proper URL decoding
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

// GET: Get materials for a project
const getMaterials = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const materials = await Material.findOne({ projectId });
    
    if (!materials) {
      return res.status(404).json({ message: "No materials found for this project" });
    }

    res.status(200).json({ materials });
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// POST: Create or add materials to a project
const createMaterial = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, color } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    if (!name) {
      return res.status(400).json({ message: "Material name is required" });
    }

    // Upload image if provided
    let imageLink = null;
    if (req.file) {
      imageLink = await uploadMaterialImage(req.file, projectId);
    }

    const materialItem = {
      name,
      color: color || "",
      imageLink,
    };

    // Find existing material document or create new one
    let material = await Material.findOne({ projectId });

    if (material) {
      // Add to existing
      material.materials.push(materialItem);
      await material.save();
    } else {
      // Create new
      material = new Material({
        projectId,
        materials: [materialItem],
      });
      await material.save();
    }

    res.status(201).json({ message: "Material added successfully", material });
  } catch (err) {
    console.error("Error creating material:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// PATCH: Update a specific material item
const updateMaterial = async (req, res) => {
  try {
    const { projectId, materialId } = req.params;
    const { name, color, removeImage } = req.body;

    if (!projectId || !materialId) {
      return res.status(400).json({ message: "projectId and materialId are required" });
    }

    const material = await Material.findOne({ projectId });

    if (!material) {
      return res.status(404).json({ message: "Material document not found" });
    }

    const item = material.materials.id(materialId);

    if (!item) {
      return res.status(404).json({ message: "Material item not found" });
    }

    // Update fields
    if (name !== undefined) item.name = name;
    if (color !== undefined) item.color = color;

    // Handle image deletion
    if (removeImage === 'true' && item.imageLink) {
      const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
      const urlPattern = new RegExp(`https://${bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`);
      const match = item.imageLink.match(urlPattern);
      
      if (match && match[1]) {
        await deleteS3Object(match[1]);
      }
      
      item.imageLink = null;
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (item.imageLink) {
        const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
        const urlPattern = new RegExp(`https://${bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`);
        const match = item.imageLink.match(urlPattern);
        
        if (match && match[1]) {
          await deleteS3Object(match[1]);
        }
      }
      
      // Upload new image
      item.imageLink = await uploadMaterialImage(req.file, projectId);
    }

    await material.save();

    res.status(200).json({ message: "Material updated successfully", material });
  } catch (err) {
    console.error("Error updating material:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE: Delete a specific material item
const deleteMaterial = async (req, res) => {
  try {
    const { projectId, materialId } = req.params;

    if (!projectId || !materialId) {
      return res.status(400).json({ message: "projectId and materialId are required" });
    }

    const material = await Material.findOne({ projectId });

    if (!material) {
      return res.status(404).json({ message: "Material document not found" });
    }

    const item = material.materials.id(materialId);

    if (!item) {
      return res.status(404).json({ message: "Material item not found" });
    }

    // Delete image from S3 if exists
    if (item.imageLink) {
      const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
      const urlPattern = new RegExp(`https://${bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`);
      const match = item.imageLink.match(urlPattern);
      
      if (match && match[1]) {
        const result = await deleteS3Object(match[1]);
        if (!result.ok) {
          console.error("Warning: Failed to delete S3 object:", result.error);
        }
      }
    }

    // Remove item from array
    material.materials.pull(materialId);
    await material.save();

    res.status(200).json({ message: "Material deleted successfully", material });
  } catch (err) {
    console.error("Error deleting material:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE: Delete all materials for a project
const deleteAllMaterials = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const material = await Material.findOne({ projectId });

    if (!material) {
      return res.status(404).json({ message: "No materials found for this project" });
    }

    // Delete all images from S3
    const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
    const urlPattern = new RegExp(`https://${bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`);

    for (const item of material.materials) {
      if (item.imageLink) {
        const match = item.imageLink.match(urlPattern);
        if (match && match[1]) {
          await deleteS3Object(match[1]);
        }
      }
    }

    // Delete the document
    await Material.findOneAndDelete({ projectId });

    res.status(200).json({ message: "All materials deleted successfully" });
  } catch (err) {
    console.error("Error deleting all materials:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  deleteAllMaterials,
};
