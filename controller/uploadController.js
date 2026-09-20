import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/aws.js";

// GET: /upload/presigned-url?fileName=file.pdf&fileType=application/pdf&folder=projects/123/orders
const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType, folder } = req.query;
    
    if (!fileName || !fileType) {
      return res.status(400).json({ message: "fileName and fileType are required" });
    }

    const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION_HV;
    
    // Sanitize filename to avoid weird characters
    const sanitizedFileName = `${Date.now()}-${fileName}`.replace(/\s+/g, "_");
    
    // Construct key (e.g. projects/123/orders/1234567-file.pdf)
    const baseFolder = folder ? (folder.endsWith('/') ? folder : `${folder}/`) : '';
    const key = `${baseFolder}${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      ACL: "public-read",
    });

    // Generate presigned URL (valid for 15 minutes)
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    // The final public URL where the file will be accessible
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    res.status(200).json({
      presignedUrl,
      publicUrl,
      key
    });
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export { getPresignedUrl };
