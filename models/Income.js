const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema({
    name:{
        required: [true,"Must Provide a Name"],
        maxlength: [10, "Must Provide a Shorter Name"],
        type: String,
        trim: true,
    },
    amount:{
        required: [true, "Must Provide a Amount"],
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        require: [true,"Please Provide a User"]
    }
},{timestamps: true})

module.exports = mongoose.model("Income",IncomeSchema);