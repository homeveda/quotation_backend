import express from "express";
import { getPresignedUrl } from "../controller/uploadController.js";

const router = express.Router();

router.get("/presigned-url", getPresignedUrl);

export default router;
