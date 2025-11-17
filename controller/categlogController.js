import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/aws.js";
import Catelog from "../model/catelogModel.js"; // adjust import path if needed


const uploadFile = async (file, subfolder,category,type) => {
    if (!file) return null;
    const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
    const filename = `${Date.now()}-${file.originalname}`.replace(/\s+/g, "_");
    const key = `${category.toLowerCase()}/${type.toLowerCase()}/${subfolder}/${filename}`;
    const Body = file.buffer
      ? file.buffer
      : fs.createReadStream(file.path);

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
      return fileUrl;
    } catch (err) {
      console.error("❌ File upload failed:", err);
      throw err;
    }
  };

const createCatelog = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { name, description, category, price, type, workType } = req.body;

    // Basic validation
    if (!name || !category || !price || !type) {
      return res
        .status(400)
        .json({ message: "name, category, price and type are required" });
    }

    const allowedCategories = ["Builder", "Economy", "Standard", "VedaX"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const allowedTypes = ["Normal", "Premium"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    const allowedWorkTypes = [
      "Wood Work",
      "Main Hardware",
      "Other Hardware",
      "Miscellaneous",
    ];
    if (workType && !allowedWorkTypes.includes(workType)) {
      return res.status(400).json({ message: "Invalid workType" });
    }

    // Multer files
    const files = req.files || {};
    const imageFile = (files.image && files.image[0]) || req.file || null;
    const videoFile = (files.video && files.video[0]) || null;

    // Validation based on type
    if (type === "Normal" && !imageFile) {
      return res
        .status(400)
        .json({ message: "Normal items require an image upload" });
    }

    if (type === "Premium") {
      if (!imageFile || !videoFile) {
        return res.status(400).json({
          message: "Premium items require both image and video uploads",
        });
      }
    }

    const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
    if (!bucket) {
      return res
        .status(500)
        .json({ message: "S3 bucket not configured (S3_BUCKET)" });
    }

    // Upload only what is needed
    const imageLink = imageFile
      ? await uploadFile(imageFile, "images", category, type)
      : undefined;

    const videoLink =
      type === "Premium"
        ? await uploadFile(videoFile, "videos", category, type)
        : undefined; // <-- Do NOT upload or set video for Normal type

    // Build catalog object
    const catalogData = {
      name,
      description,
      imageLink,
      category,
      price,
      type,
      workType,
    };

    // Only attach video field when premium
    if (type === "Premium") {
      catalogData.video = videoLink;
    }

    const catelog = new Catelog(catalogData);

    await catelog.save();

    res.status(201).json({ catelog });
  } catch (error) {
    console.error("❌ Error creating catalog:", error);
    res.status(500).json({ message: error.message });
  }
};


const getAllCatelogs = async (req, res) => {
    try {
        const catelogs = await Catelog.find();
        res.status(200).json(catelogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCatelog = async (req, res) => {
    try{
      const name1 = req.params.name;
      console.log(name1)
      const {name,description,category,price,type,workType} = req.body;
      const catelog = await Catelog.findOne({ name: name1 });
      if (!catelog) {
        return res.status(404).json({ message: "Catelog not found" });
      }
      catelog.name = name || catelog.name;
      catelog.description = description || catelog.description;
      catelog.category = category || catelog.category;
      catelog.price = price || catelog.price;
      catelog.type = type || catelog.type;
      catelog.workType = workType || catelog.workType;
      const files = req.files || {};
      const imageFile = (files.image && files.image[0]) || req.file || null;
      const videoFile = (files.video && files.video[0]) || null;
      const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
      if (!bucket) {
        return res
          .status(500)
          .json({ message: "S3 bucket not configured (S3_BUCKET)" });
      }
      if(type === "Normal" && imageFile){
        catelog.imageLink = await uploadFile(imageFile, "images", category,type);
      }
      if(type === "Premium"){
        if(imageFile){
          catelog.imageLink = await uploadFile(imageFile, "images", category,type);
        }
        if(videoFile){
          catelog.video = await uploadFile(videoFile, "videos", category,type);
        }
      }
      await catelog.save();
      res.status(200).json({ message: "Catelog updated successfully", catelog });
    }catch(error){
      console.log(error);
      res.status(500).json({ message: error.message });
    }
};

const getCatelogByName = async (req, res) => {
    try {
        const { name } = req.params;
        const catelog = await Catelog.findOne({ name });
        if (!catelog) {
            return res.status(404).json({ message: "Catelog not found" });
        }
        res.status(200).json(catelog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCatelog = async (req, res) => {
    try {
        const { name } = req.params;
        const catelog = await Catelog.findOneAndDelete({ name });
        if (!catelog) {
            return res.status(404).json({ message: "Catelog not found" });
        }
        res.status(200).json({ message: "Catelog deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export { createCatelog, getAllCatelogs, getCatelogByName, deleteCatelog, updateCatelog };