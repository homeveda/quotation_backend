import mongoose,{Schema} from mongoose;

const itemSchema = new Schema({
    name: { type: String, required: true },
    imageLink: {
        type: String,
    },
    video: {
        type: String,
    },
    design: {
        type: String,
    }
});

const designSchema = new Schema({
    projectId: {
        type: UUID,
        required: true,
        ref: "Project", // Reference to Project model's id field
    },
    items: [itemSchema]
});

