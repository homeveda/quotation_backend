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

// File type filter for materials (images + documents)
const materialFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: images (JPEG, PNG, GIF, WebP), PDF, Word (DOC, DOCX), Excel (XLS, XLSX)'));
  }
};

const materialUpload = multer({
  storage,
  fileFilter: materialFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for materials
  }
});

// Reusable field uploaders
export const catelogUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

export const singleImage = upload.single('image');
export const singleVideo = upload.single('video');
export const materialFileUpload = materialUpload.single('file');

export default upload;
