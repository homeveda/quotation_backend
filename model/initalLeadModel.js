//Name Address Contact Number Architect status(Account creation)
import mongoose, { Schema } from "mongoose";

const initalLeadSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  architectStatus: {
    type: String,
    enum: ["Account Created", "Account Not Created"],
    default: "Account Not Created",
    required: true,
  },
});

const InitalLead = mongoose.model("InitalLead", initalLeadSchema);

export default InitalLead;
