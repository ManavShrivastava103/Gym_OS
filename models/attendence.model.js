const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

    gym: {type: mongoose.Types.ObjectId, ref: "gyms", required: true},
    member: {type: mongoose.Types.ObjectId, ref: "members", required: true},
    attendanceDate: {type: Date, required: true},
    checkInTime: {type: Date, default: Date.now}, 
    notes: String,
    markedBy: {type: mongoose.Types.ObjectId, ref: "users"}

}, { timestamps: true });

attendanceSchema.index({member: 1, attendanceDate: 1}, {unique: true});

const attendanceModel = mongoose.model("attendance", attendanceSchema);

module.exports = attendanceModel;