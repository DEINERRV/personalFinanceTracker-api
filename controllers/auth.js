const User = require("../models/User");
const {StatusCodes} = require("http-status-codes");
const {BadRequestError,UnauthenticatedError} = require("../errors/");

const register = async (req, res)=>{
    const user = await User.create({...req.body})
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({user:{name:user.name}, token})
}

const login = async (req,res)=>{   
    const {email,password} = req.body

    //Check for empty values
    if(!email || !password)
        throw new BadRequestError("Please provide email and password")
    
    //Check if the user exist
    const user = await User.findOne({email})
    if(!user)
        throw new UnauthenticatedError("Invalid Credentials")

    //Check if the password is correct
    if(!await user.comparePassword(password))
        throw new UnauthenticatedError("Invalid Credentials")
    
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({user:{name:user.name},token})
}

module.exports = {
    register,
    login
}