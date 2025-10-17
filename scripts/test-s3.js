import { s3 } from '../config/aws.js';
import { ListBucketsCommand } from '@aws-sdk/client-s3';

const testS3 = async () => {
  try {
    console.log('Testing S3 connectivity...');
    
    // Create and send a ListBucketsCommand
    const command = new ListBucketsCommand({});
    const res = await s3.send(command);
    
    console.log('✅ S3 listBuckets response:');
    console.log(res.Buckets);
  } catch (err) {
    console.error('❌ S3 connectivity test failed:');
    console.error(err);
  }
};

testS3();
