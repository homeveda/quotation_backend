import mongoose,{Schema} from "mongoose";

const itemSchema = new Schema({
    name: {
        type: String
    },
    imageLink: {
        type: String,
    },
    designLink: {
        type: String,
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