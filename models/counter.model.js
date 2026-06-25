const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({

    gym: {type: mongoose.Types.ObjectId, ref: "gyms", required: true},
    counterName: {type: String, required: true},
    sequenceValue: {type: Number, default: 0}

}, { timestamps: true });

counterSchema.index({ gym: 1, counterName: 1 },{ unique: true });

const counterModel = mongoose.model("counters", counterSchema);

module.exports = counterModel;