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
  architectName: {
    type: String,
  },
  architectContact: {
    type: String,
  },
  architectAddress: {
    type: String,
  },
  leadStatus:{
    type: String,
    //Notes instead of stages 
    // Glass Work required 
  },Requirements:{
    type: [String],
    // options which can be picked -> Glass Work, Kitchen, Wardrobe, Facade
  },category:{
    type : [String],
    // options which can be picked -> Builder, Economy, Standard, VedaX
  }
});

const InitalLead = mongoose.model("InitalLead", initalLeadSchema);

export default InitalLead;
