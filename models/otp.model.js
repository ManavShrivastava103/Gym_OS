const mongoose = require("mongoose");

const otp_purposes =  ["login","forgot_password","registration"];

const otpSchema = new mongoose.Schema({

    email: {type: String, lowercase: true, trim: true, required:true},
    gym: {type: mongoose.Types.ObjectId, ref: "gyms", required: true},
    otp: {type: String, required: true},
    purpose: {type: String, enum: otp_purposes, required: true},
    expiresAt: {type: Date, required: true},
    verified: {type: Boolean, default: false},
    attempts: {type: Number, default:0},

}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ gym: 1, email: 1, purpose: 1 },{ unique: true });

const otpModel = mongoose.model("otps", otpSchema);

module.exports = otpModel;