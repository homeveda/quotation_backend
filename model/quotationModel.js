import mongoose, { Schema } from "mongoose";
import { DEPARTMENT_WORKTYPE_MAP } from "./catelogModel.js";

const ALL_DEPARTMENTS = Object.keys(DEPARTMENT_WORKTYPE_MAP);
const ALL_WORKTYPES = [...new Set(Object.values(DEPARTMENT_WORKTYPE_MAP).flat())];

const itemSchema = new Schema(
    {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        department: {
            type: String,
            enum: ALL_DEPARTMENTS,
        },
        workType:{
            type: String,
            enum: ALL_WORKTYPES,
        },
    },
    { _id: false }
);

const quotationSchema = new Schema(
    {
        projectId: {
            type: String,
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
            freightInstallationHandling: { type: Number, default: 0 },
            discount: { type: Number, default: 18 },
            taxPercent: { type: Number, default: 0 },
            taxAmount: { type: Number, default: 0 },
            grandTotal: { type: Number, default: 0 }
        },
        notes: { type: String },
    },
    { timestamps: true }
);

const Quotation = mongoose.model("Quotation", quotationSchema);
export default Quotation;