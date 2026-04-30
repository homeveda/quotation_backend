import multer from "multer";

const storage = multer.memoryStorage();

// Whitelist: images + PDF + DOC/DOCX
const ALLOWED_MIMETYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf",
    "application/msword",                                                       // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",   // .docx
];

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PNG, JPG, WEBP, PDF, DOC, DOCX`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

export default upload;