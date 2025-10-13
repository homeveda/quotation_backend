import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

AWS.config.update({
    accessKeyId:process.env.AWS_ACCESS_KEY,
    secretAccessKey:process.env.AWS_SECRET_KEY,
    region:"ap-south-1",
});

const s3 = new AWS.S3();
console.log("AWS S3 Configured");
export {s3};