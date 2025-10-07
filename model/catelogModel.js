import mongoose, { Schema } from "mongoose";

const catelogSchema = new Schema({
  name: {
    type: String,
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
  category: {
    type: String,
    enum: ["Builder", "Economy", "Standard", "VedaX"]
  },
  price: {
    type: Number,
    required: true
  },
  type:{
    type: String,   
    enum: ["Normal","Premium"]
  }
});

const Catelog = mongoose.model("Catelog", catelogSchema);

export default Catelog;
