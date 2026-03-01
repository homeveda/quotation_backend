//Name Address Contact Number 
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
    
  },
  contactNumber: {
    type: String,
    
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
  Requirements:{
    type: [String],
    // options which can be picked -> Glass Work, Kitchen, Wardrobe, Facade
  },category:{
    type : [String],
    // options which can be picked -> Builder, Economy, Standard, VedaX
  },
  assignedRoles: {
    type: [String],
    default: [],
    // manually set – which admin roles can see this lead
  }
});

const InitalLead = mongoose.model("InitalLead", initalLeadSchema);

export default InitalLead;
