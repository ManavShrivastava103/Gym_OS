const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({

    entityType : {type: String, enum: ["user", "member"], required: true},
    entityId : {type: mongoose.Types.ObjectId, required: true},
    purpose : {type: String, enum: ["invite", "forgot_password"], required: true},
    token : {type: String, required: true, unique: true},
    used : {type: Boolean, default: false}

}, {
    timestamps: true
});

const tokenModel = mongoose.model("tokens",tokenSchema);

module.exports = tokenModel;