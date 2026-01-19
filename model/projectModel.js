import mongoose,{ Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const kitchenSchema = new Schema({
    kitchenType: {
        type: String,
        enum: ["L-Shape","U-Shape","Parallel","Straight"]
    },
    requiremntsOfCounter:{
        type: String,
        enum:["Island","Breakfast counter"]
    },
    appliances :{
        type: [String],
    },
    loftRequired:{
        type: Boolean,
        default: false,
    },
    theme:{
        type: String,
        enum:["Classical","Modern","Modern luxury","Modern minimalist","Minimalist","Contemporary","Japandi","Mid-century"]
    },
    layoutPlan:{
        type: [String],
    },
    additionalRequirements:{
        type: String,
    }
});

const wardrobeSchema = new Schema({
    type:{
        type: [String],
    },
    additionalRequirements:{
        type: String,
    },
    measureents:{
        type:[String],
    }
});

const projectSchema = new Schema({
    id:{
        type: "String",
        default: uuidv4,
        unique: true
    },
    userEmail: {
        type: String,
        required: true,
        ref: "User", // Reference to User model's email field
    },
    architectName: {
        type: String,
    },
    projectHead:{
        type: String,
        required: true
    },
    category:{
        type : String,
        enum : ["Builder","Economy","Standard","VedaX"]
    },
    status:{
        type: String,
        enum:["Design Approvals","Order Booking","Site Measurement","Production","Inspection","Installation","Expreience"],
    },
    kitchen: {
        type: kitchenSchema,
        required: false
    },
    wardrobe: {
        type: wardrobeSchema,
        required: false
    }
});

const Project = new mongoose.model("Project", projectSchema);

export default Project;