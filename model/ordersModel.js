import mongoose,{Schema} from "mongoose";

const itemSchema = new Schema({
    fileLink: {
        type: String,
    },
    fileType: {
        type: String,
        enum: ["image", "pdf", "doc"],
        default: "image"
    },
    
});

const orderSchema = new Schema({
    projectId: {
        type: "String",
        required: true,
        ref: "Project", // Reference to Project model's id field
    },
    items: [itemSchema]
});

const Order = mongoose.model("Order", orderSchema);
export default Order;