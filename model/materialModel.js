import mongoose,{Schema} from "mongoose";

const materialItemsSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    color:{
        type: String,
    },
    imageLink:{
        type: String,
    },

});

const materialSchema = new Schema({
    projectId:{
        type : String,
        required : true,
        ref: "Project",
    },
    materials:{
        type: [materialItemsSchema],
    },
});

const Material = mongoose.model("Material", materialSchema);

export default Material;
