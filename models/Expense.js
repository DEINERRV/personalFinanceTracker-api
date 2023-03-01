const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    name:{
        required: [true,"Must Provide a Name"],
        type: String,
        maxlength: [20, "Must Provide a Short Name"],
        trim: true
    },
    amount:{
        required: [true, "Must Provide a Amount"],
        type: Number
    },
    category:{
        type: String,
        enum: ["Other","Grocery","Meal","Recreation","Shopping","Utility","Vehicle"],
        default: "Other"
    },
    type:{
        type: String,
        enum: ["Cash","Credit Card","Crypto"],
        default: "Cash"
    },
    description:{
        type: String,
        maxlength: [100, "Description too large"]
    },
    expenseOwner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        require: [true,"Please Provide a User"]
    }
},{timestamps: true})

module.exports = mongoose.model("Expense",ExpenseSchema);