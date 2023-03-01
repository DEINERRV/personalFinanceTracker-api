const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Must Provied a Name"],
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true,"Must Provied a email"],
        unique: true,
        trim: true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please Provide a valid email"
        ]
    },
    password: {
        type: String,
        required: [true,"Must Provied a Password"],
        minlength: 6
    },
    balance: {
        type: Number,
        default: 0
    }
})

UserSchema.pre("save",async function(){
    //Encrypt the password
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
    //Round the balance
    this.balance = Number.parseFloat(this.balance).toFixed(2);
})

UserSchema.pre("findOneAndUpdate",async function(){
    //Encrypt the password
    if(this._update.password){
        const salt = await bcrypt.genSalt(10)
        this._update.password = await bcrypt.hash(this._update.password,salt)
    }
    //Round the balance
    if(this._update.balance)
        this._update.balance = Number.parseFloat(this._update.balance).toFixed(2);

})

UserSchema.methods.createJWT = function(){
    return jwt.sign(
        {userId:this._id, name:this.name, email:this.email},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_LIFETIME})
}

UserSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password);
}

module.exports = mongoose.model("User", UserSchema);