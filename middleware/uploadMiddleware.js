import multer from 'multer';

// Memory storage so files are available as buffers (you can switch to diskStorage if desired)
const storage = multer.memoryStorage();

// Limits: adjust fileSize as needed (bytes). Here 20MB for video, 5MB for images as a default cap.
const upload = multer({
  storage,
  limits: {
    // no global limit here; individual routes may enforce limits
  }
});

// Reusable field uploaders
export const catelogUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

export const singleImage = upload.single('image');
export const singleVideo = upload.single('video');

export default upload;
