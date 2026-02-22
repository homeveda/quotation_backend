import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const architectSchema = new Schema(
  {
    architectName: {
      type: String,
    },
    architectContact: {
      type: String,
    },
    architectAddress: {
      type: String,
    },
  },
  { timestamps: true },
);

const Architect = mongoose.model("Architect", architectSchema);

export default Architect;
