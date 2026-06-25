const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
    dayName  : { type: String, required: true },
    dayOrderNum : { type: Number, required: true },
    meals : [{
        mealDesc : { type: String, required: true },
        mealTime : { type: String, required: true }, 
        mealOrderNum : { type: Number, required:true },
    }]
}, { _id: false });


const dietPlanSchema = new mongoose.Schema({

    name : { type:String, required:true },
    description : { type:String },
    gym : { type:mongoose.Types.ObjectId, ref:"gyms", required:true },
    active: { type: Boolean, default: true },
    durationInDays: { type: Number, required: true },

    targetCaloriesPerDay : { type: Number, required: true},
    targetProteinPerDay : { type: Number, default: 0 },
    targetCarbsPerDay: { type: Number, default: 0 },
    targetFatsPerDay: { type: Number, default: 0 },

    mealsPerDay : [mealSchema]

}, { timestamps:true });

const dietPlanModel = model("dietPlan", dietPlanSchema);

module.exports = dietPlanModel;
