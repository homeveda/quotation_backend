import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Types;

const itemSchema = new Schema(
    {
        name: { type: String, required: true },
        floor: { type: String },
        area: { type: String },
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
        totalPrice: { type: Number, required: true }
    },
    { _id: false }
);

const quotationSchema = new Schema(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },
       // Client details auto-populated from Project and User models
        siteAddress: { type: String },
        zone: { type: String },
        category: { type: String }, // e.g. Consoles, Remotes
        items: [itemSchema],
        totals: {
            grossAmount: { type: Number, default: 0 },
            freightInstallationHandling: { type: Number, default: 0 },
            totalBeforeTax: { type: Number, default: 0 },
            taxPercent: { type: Number, default: 0 },
            taxAmount: { type: Number, default: 0 },
            grandTotal: { type: Number, default: 0 }
        },
        notes: { type: String },
        status: { type: String, enum: ["draft", "sent", "accepted", "rejected"], default: "draft" }
    },
    { timestamps: true }
);

const Quotation = mongoose.model("Quotation", quotationSchema);
export default Quotation;