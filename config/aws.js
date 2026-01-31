import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION_HV,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_HV,
    secretAccessKey: process.env.AWS_SECRET_KEY_HV,
  },
});

console.log("AWS S3 Configured (v3)");
export { s3 };
