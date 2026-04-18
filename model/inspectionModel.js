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

    },
    plumbingVideo:{
        type:String,
    },
    electricityStatus:{
        type: String,
      
    },
    electricityVideo:{
        type:String,
    },
    chimneyPointStatus:{
        type: String,
      
    },
    chimneyPointVideo:{
        type:String,
    },
    falseCeilingStatus:{
        type: String,
        
    },
    falseCeilingVideo:{
        type:String,
    },
    flooringStatus:{
        type: String,
      
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