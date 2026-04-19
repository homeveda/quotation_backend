import mongoose,{Schema} from "mongoose";

const itemSchema = new Schema({
    name: {
        type: String
    },
    imageLink: {
        type: String,
    },
    imageFileType: {
        type: String,
        enum: ["image", "pdf", "doc"],
        default: "image"
    },
    designLink: {
        type: String,
    },
    designFileType: {
        type: String,
        enum: ["image", "pdf", "doc"],
        default: "image"
    }
});

const designSchema = new Schema({
    projectId: {
        type: "String",
        required: true,
        ref: "Project", // Reference to Project model's id field
    },
    items: [itemSchema]
});

const Design = mongoose.model("Design", designSchema);
export default Design;