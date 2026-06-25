const mongoose = require("mongoose");

const member_statuses = ["active", "inactive", "suspended", "interested"];

const membersSchema = new mongoose.Schema({
    
    fullName : { type:String, required:true, trim: true },
    email : { type:String, required:true, lowercase: true, trim: true },
    phone : { type:String, required:true },
    password : {type: String},
    joiningdate : { type:Date },
    registrationdate : { type:Date, default:Date.now },
    address : { type:String },
    dob : { type:Date, required:true },
    status : { type:String, enum:member_statuses, default:member_statuses[3]},
    lastLoginAt : Date,
    gym : { type:mongoose.Types.ObjectId, ref:"gyms"},
    
    physique : {
        heightInCm : { type:Number },
        weightInKg : { type:Number },
        targetWeightInKg : { type:Number },
    },
    
    fee : {
        total : { type:Number, default:0 },
        paid : { type:Number, default:0 },
    },

    membership : { 
        plan : { type:mongoose.Types.ObjectId, ref: "membershipplans" },
        planStartDate : { type:Date },
        planEndDate : { type:Date }
    },

    diet : { 
        plan : { type:mongoose.Types.ObjectId, ref: "dietplans" },
        planStartDate : { type:Date },
        planEndDate : { type:Date }
    },

    workout : { 
        plan : { type:mongoose.Types.ObjectId, ref: "workoutplans" },
        planStartDate : { type:Date },
        planEndDate : { type:Date }
    },

    registeredBy : { type:mongoose.Types.ObjectId, ref: "users" },

}, { timestamps:true });

membersSchema.index({ gym: 1, email: 1 }, { unique: true });

const membersModel = model("member", membersSchema);

module.exports = membersModel;