import mongoose, { Schema } from "mongoose";

const DEPARTMENT_WORKTYPE_MAP = {
  Kitchen: [
    "Carcass", "Shutters", "Visibles", "Base And Back",
    "Basic Hardware", "Additional Hardware", "Other Hardware",
    "Countertop", "Appliances"
  ],
  Wardrobe: [
    "Carcass", "Shutters", "Base And Back", "Visibles",
    "Basic Hardware", "Additional Hardware", "Other Hardware"
  ],
  Glass: [
    "Sliding Partitions", "Shower Cubicles", "Mirrors", "Railing"
  ],
  Facade: [
    "Elevation", "Double Height Lobby", "Highlighter Wall",
    "Washrooms", "Countertop"
  ]
};

const ALL_DEPARTMENTS = Object.keys(DEPARTMENT_WORKTYPE_MAP);
const ALL_WORKTYPES = [...new Set(Object.values(DEPARTMENT_WORKTYPE_MAP).flat())];

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
  department: {
    type: String,
    enum: ALL_DEPARTMENTS,
    required: true
  },
  workType: {
    type: String,
    enum: ALL_WORKTYPES,
    required: true
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
  type: {
    type: String,
    enum: ["Normal", "Premium"],
    required: true
  },
  displayedToClients: {
    type: Boolean,
    default: true
  },
});

// Validate that workType belongs to the selected department
catelogSchema.pre('validate', function (next) {
  if (this.department && this.workType) {
    const allowedWorkTypes = DEPARTMENT_WORKTYPE_MAP[this.department];
    if (!allowedWorkTypes || !allowedWorkTypes.includes(this.workType)) {
      return next(new Error(
        `Work type "${this.workType}" is not valid for department "${this.department}". Allowed: ${allowedWorkTypes?.join(', ')}`
      ));
    }
  }
  next();
});

const Catelog = mongoose.model("Catelog", catelogSchema);

export { DEPARTMENT_WORKTYPE_MAP };
export default Catelog;
