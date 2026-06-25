const mongoose = require("mongoose");

const user_statuses = ["active", "inactive", "suspended", "deleted"];

const userSchema = new mongoose.Schema({

    fullName : {type: String, required: true, trim: true},
    email : {type: String, required: true, unique: true, lowercase: true, trim: true},
    phone : {type: String, unique: true, required:true},
    password : {type: String},
    role : {type:  mongoose.Types.ObjectId, required: true},
    status : {type: String, enum: user_statuses, default: "active"},
    gym : {type: mongoose.Types.ObjectId, ref: "gyms", required: true},
    dob : Date,
    joiningDate : {type: Date, default: Date.now},
    lastLoginAt : Date,
    createdBy : {type: mongoose.Types.ObjectId, ref: "users"},
    isSystemAdmin : {type:Boolean, deault:false}

}, { timestamps: true });

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;