import mongoose,{ Schema } from "mongoose";

const projectSchema = new Schema({
    id:{
        type: "String",
        primaryKey: true
    },
    userEmail: {
        type: String,
        required: true,
        ref: "User", // Reference to User model's email field
    },
    architectName: {
        type: String,
    },
    category:{
        type : String,
        enum : ["Builder","Economy","Standard","VedaX"]
    }
});

const Project = new mongoose.model("Project", projectSchema);

export default Project;