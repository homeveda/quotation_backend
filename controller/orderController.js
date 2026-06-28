import Order from "../model/ordersModel.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/aws.js";

// Upload file to S3
const uploadOrderFile = async (file, projectId) => {
  if (!file) return null;
  const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
  const filename = `${Date.now()}-${file.originalname}`.replace(/\s+/g, "_");
  const key = `projects/${projectId}/orders/${filename}`;

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
    console.log("✅ Order file uploaded:", fileUrl);
    return fileUrl;
  } catch (err) {
    console.error("❌ Order file upload failed:", err);
    throw err;
  }
};

// Delete S3 object
const deleteS3Object = async (key) => {
  if (!key) return { key, ok: false, error: "No key provided" };
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

// Determine file type from mimetype
const getFileType = (mimetype) => {
  if (mimetype === "application/pdf") return "pdf";
  if (
    mimetype === "application/msword" ||
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "doc";
  // Default to image for everything else
  return "image";
};

// GET: Get all orders for a project
const getOrders = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const order = await Order.findOne({ projectId });
    if (!order) {
      return res.status(200).json({ order: { projectId, items: [] } });
    }

    res.status(200).json({ order });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// POST: Upload file(s) to a project's orders
const createOrder = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one file is required" });
    }

    const newItems = [];

    for (const file of req.files) {
      try {
        const fileUrl = await uploadOrderFile(file, projectId);
        newItems.push({
          fileLink: fileUrl,
          fileType: getFileType(file.mimetype),
        });
      } catch (uploadErr) {
        console.error("❌ Failed to upload order file:", uploadErr);
        return res.status(500).json({
          message: "File upload to S3 failed",
          error: uploadErr.message,
        });
      }
    }

    // Find existing order document or create new one
    let order = await Order.findOne({ projectId });

    if (order) {
      order.items.push(...newItems);
      await order.save();
    } else {
      order = new Order({
        projectId,
        items: newItems,
      });
      await order.save();
    }

    res.status(201).json({ message: "Order files uploaded successfully", order });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE: Delete a specific order item
const deleteOrder = async (req, res) => {
  try {
    const { projectId, itemId } = req.params;
    if (!projectId || !itemId) {
      return res.status(400).json({ message: "projectId and itemId are required" });
    }

    const order = await Order.findOne({ projectId });
    if (!order) {
      return res.status(404).json({ message: "Order document not found" });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Order item not found" });
    }

    // Delete file from S3 if exists
    if (item.fileLink) {
      const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
      const urlPattern = new RegExp(
        `https://${bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`
      );
      const match = item.fileLink.match(urlPattern);
      if (match && match[1]) {
        const result = await deleteS3Object(match[1]);
        if (!result.ok) {
          console.error("Warning: Failed to delete S3 object:", result.error);
        }
      }
    }

    // Remove item from array
    order.items.pull(itemId);
    await order.save();

    res.status(200).json({ message: "Order file deleted successfully", order });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE: Delete all orders for a project
const deleteAllOrders = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const order = await Order.findOne({ projectId });
    if (!order) {
      return res.status(404).json({ message: "No orders found for this project" });
    }

    // Delete all files from S3
    const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
    const urlPattern = new RegExp(
      `https://${bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`
    );

    for (const item of order.items) {
      if (item.fileLink) {
        const match = item.fileLink.match(urlPattern);
        if (match && match[1]) {
          await deleteS3Object(match[1]);
        }
      }
    }

    // Delete the document
    await Order.findOneAndDelete({ projectId });

    res.status(200).json({ message: "All order files deleted successfully" });
  } catch (err) {
    console.error("Error deleting all orders:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export { getOrders, createOrder, deleteOrder, deleteAllOrders };
