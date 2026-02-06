import mongoose, { Schema } from "mongoose";

const catelogSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  imageLink: {
    type: String,
  },
  video: {
    type: String,
  },
  workType:{
    type: String, 
    enum: ["Carcass","Shutters","Visibles","Base And Back","Main Hardware","Other Hardware","Miscellaneous","Countertop","Appliances"],
  },
  //Wood Word -> Carcuass Shutters, Visibles, Base And Back
  //Hardware -> Main Hardware Other Hardware
  //Countertop
  //Miscellaneous
  //Appliances
  category: {
    type: String,
    enum: ["Builder", "Economy", "Standard", "VedaX"],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  type:{
    type: String,   
    enum: ["Normal","Premium"],
    required: true
  },
  displayedToClients: {
    type: Boolean,
    default: true
  },
});

// Require video field for Premium items
// catelogSchema.pre('validate', function(next) {
//   if (this.type === 'Premium' && !this.video) {
//     next(new Error('Premium catalog items must include a video link'));
//   } else {
//     next();
//   }
// });
const Catelog = mongoose.model("Catelog", catelogSchema);

export default Catelog;
