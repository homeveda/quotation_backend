import Catelog from '../models/catelog.js';
import {s3} from '../config/aws.js';

export const createCatelog = async (req, res) => {
    try {
        const { title, description } = req.body;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
    }catch(err){
        
    }
};