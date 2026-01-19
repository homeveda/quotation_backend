import { Router } from "express";
import mongoose,{Schema} from "mongoose";

const projectInspectionSchema = new Schema({
    projectId:{
        type : String,
        required : true,
        ref: "Project",
    },
    inspectionDate:{
        type: Date,
    },
    plumbingStatus:{
        type: String,
        enum:["Pending","Completed","In Progress","Not Required"],
    },
    plumbingVideo:{
        type:String,
    },
    electricityStatus:{
        type: String,
        enum:["Pending","Completed","In Progress","Not Required"],
    },
    electricityVideo:{
        type:String,
    },
    chimneyPointStatus:{
        type: String,
        enum:["Pending","Completed","In Progress","Not Required"],
    },
    chimneyPointVideo:{
        type:String,
    },
    falseCeilingStatus:{
        type: String,
        enum:["Pending","Completed","In Progress","Not Required"],
    },
    falseCeilingVideo:{
        type:String,
    },
    flooringStatus:{
        type: String,
        enum:["Pending","Completed","In Progress","Not Required"],
    },
    flooringVideo:{
        type:String,
    },
    otherVideos:{
        type:[String],
    },
    readyForNextPhase:{
        type: Boolean,
        default: false,
    }
});

const ProjectInspection = mongoose.model("ProjectInspection", projectInspectionSchema);

export default ProjectInspection;