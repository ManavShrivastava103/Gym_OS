const mongoose = require("mongoose");

const statuses = ["available", "coming soon"];

const productSchema = new mongoose.Schema({

    gym : { type: mongoose.Types.ObjectId, ref:"gyms", required:true },
    name : { type: String, required:true },
    description : { type: String },
    status: { type: String, enum: statuses, default: true },
    quantity: { type: Number, required: true },
    price: { type: Number, default:0 },
    category : { type: String, required:true },
    image : { type: String },
    priorityOrder : {type:Number, default:0 }

}, { timestamps:true });

const productModel = model("product", productSchema);

module.exports = productModel;
