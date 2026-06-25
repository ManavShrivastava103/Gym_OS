const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
        exerciseDesc : { type: String, required: true },
        exerciseDuration : { type: Number },
        sets : { type: Number }, 
        reps : { type: Number }, 
        exerciseOrderNum : { type: Number, required:true },
        tip : { type: String },
}, { _id: false });

const levels = ["beginner", "intermediate", "advanced"];


const workoutPlanSchema = new mongoose.Schema({

    name : { type:String, required:true },
    description : { type:String },
    gym : { type:mongoose.Types.ObjectId, ref:"gyms", required:true },
    active: { type: Boolean, default: true },
    durationInDays: { type: Number, required: true },

    category: { type: String, required: true},
    level: { type: String, enum: levels },

    targetCaloryBurnPerDay : { type: Number, required: true },

    workoutPerDay : {
        sunday : [workoutSchema],
        monday : [workoutSchema],
        tuesday : [workoutSchema],
        wednesday : [workoutSchema],
        thursday : [workoutSchema],
        friday : [workoutSchema],
        saturday : [workoutSchema]
    },

}, { timestamps:true });

const workoutPlanModel = model("workoutPlan", workoutPlanSchema);

module.exports = workoutPlanModel;
