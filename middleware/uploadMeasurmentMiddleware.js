import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits:{
        fileSize: 20 * 1024 * 1024 // 10MB limit for measurement files
    }
})

export default upload;