import mongoose, { Schema } from "mongoose";


const itemSchema = new Schema(
    {
        name: { type: String, required: true },
        floor: { type: String },
        area: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        workType:{
            type: String,
            enum: ["Wood Work","Main Hardware","Other Hardware","Miscelaneous"],
        },
    },
    { _id: false }
);

const quotationSchema = new Schema(
    {
        projectId: {
            type: "String",
            ref: "Project",
            required: true
        },
       // Client details auto-populated from Project and User models
        siteAddress: { type: String },
        category: { type: String }, // e.g. Consoles, Remotes 
        //Wood Work, Main Hardware, Other Hardware 
        items: [itemSchema],
        totals: {
            grossAmount: { type: Number, default: 0 },
            discount: { type: Number, default: 0 },
            // taxPercent: { type: Number, default: 0 },
            taxAmount: { type: Number, default: 0 },
            freightInstallationHandling: { type: Number, default: 0 },
            grandTotal: { type: Number, default: 0 }
        },
        notes: { type: String },
    },
    { timestamps: true }
);

const Quotation = mongoose.model("Quotation", quotationSchema);
export default Quotation;