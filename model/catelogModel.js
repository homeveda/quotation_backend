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
  }
});

// Require video field for Premium items
catelogSchema.pre('validate', function(next) {
  if (this.type === 'Premium' && !this.video) {
    next(new Error('Premium catalog items must include a video link'));
  } else {
    next();
  }
});

// Virtual to suggest media folder based on category
catelogSchema.virtual('mediaFolder').get(function() {
  return `media/${this.category.toLowerCase()}`;
});

const Catelog = mongoose.model("Catelog", catelogSchema);

export default Catelog;
