const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({

    roleName : { type: String, required: true, trim: true, lowercase: true },
    gym : { type: mongoose.Types.ObjectId, ref: "gyms", required: true },
    createdBy : { type: mongoose.Types.ObjectId, ref: "users" },
    permissions : { type: [String], default:[] },
    isCustom : {type:Boolean, default:true},

}, { timestamps: true });

roleSchema.index({ gym: 1, roleName: 1 }, { unique: true });

const roleModel = mongoose.model("roles", roleSchema);

module.exports = roleModel;