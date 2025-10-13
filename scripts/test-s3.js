import { s3 } from '../config/aws.js';

const testS3 = async () => {
  try {
    console.log('Testing S3 connectivity...');
    const res = await s3.listBuckets().promise();
    console.log('S3 listBuckets response:');
    console.log(res);
  } catch (err) {
    console.error('S3 connectivity test failed:');
    console.error(err);
  }
};

testS3();
