const Expense = require("../models/Expense");
const User = require("../models/User");
const {StatusCodes} = require("http-status-codes");
const {BadRequestError} = require("../errors/");

const getAllExpenses = async(req,res)=>{
    const queryObject = {};
    const {name,category,type,numericFilters,dateFilters,sort,fields} = req.query;
    queryObject.expenseOwner = req.user.id;

    //filters
    if(name)
        queryObject.name = {$regex: name, $options: "i"};
    if(category)
        queryObject.category = category;
    if(type)
        queryObject.type = type;
    //Special filters type
    const operatorMap = {
        ">":"$gt",
        ">=":"$gte",
        "&lt;":"$lt",
        "&lt;=":"$lte",
        "=":"$eq"
    }
    const regEx = /\b(&lt;|>|=|>=|&lt;=)\b/g;
    if(dateFilters){
        let filter = dateFilters.replace(regEx,(e)=>`-${operatorMap[e]}-`);
        const options = ["createdAt","updatedAt"];
        filter = filter.split(",").forEach(e => {
            const [field,operator,year,month,day] = e.split("-");
            if(options.includes(field)){
                const value = year+"-"+month+"-"+day;
                queryObject[field] = {...queryObject[field],[operator]:value};
            }
        });
        console.log(queryObject.createdAt)
    }
    if(numericFilters){
        let filter = numericFilters.replace(regEx,(e)=>`-${operatorMap[e]}-`);
        filter = filter.split(",").forEach(e => {
            const [field,operator,value] = e.split("-");
            if(field === "amount")
                queryObject[field] = {...queryObject[field],[operator]:Number(value)};
        });
    }
        
    let result = Expense.find(queryObject);
    
    //sort
    if(sort){
        const sortList = sort.split(",").join(" ");
        result = result.sort(sortList);
    }
    else{
        result = result.sort("createAt");
    }

    //fields
    if(fields){
        const fieldList = fields.split(",").join(" ");
        result = result.select(fieldList);
    }

    //pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    result = result.limit(limit).skip(limit*(page-1));

    //execution 
    const expenses = await result;
    res.status(200).json({expenses,amount: expenses.length});
}

const getExpense = async(req,res)=>{
    const expense = await Expense.find({_id: req.params.id, expenseOwner: req.user.id})
    if(!expense)
        throw new BadRequestError(`No expense with id: ${req.params.id}`)
    
    res.status(StatusCodes.OK).json(expense)
}

const createExpense = async(req,res)=>{
    //Save
    req.body.expenseOwner = req.user.id
    const expense = await Expense.create(req.body)
    //Update the user balance
    const user = await User.findOne({_id: req.user.id}).select("balance")
    await User.findOneAndUpdate({_id: req.user.id},{balance: user.balance-expense.amount})

    res.status(StatusCodes.CREATED).json(expense)
}

const deleteExpense = async(req,res)=>{
    //Delete
    const expense = await Expense.findOneAndDelete({_id: req.params.id, expenseOwner: req.user.id})
    if(!expense)
        throw new BadRequestError(`No expense with id: ${req.params.id}`)
    //Update the user balance
    const user = await User.findOne({_id: req.user.id}).select("balance")
    await User.findOneAndUpdate({_id: req.user.id},{balance: user.balance+expense.amount})
    res.status(StatusCodes.OK).json(expense)
}

const updateExpense = async(req,res)=>{
    const {name,amount,} = req.body

    if(!name || !amount || name=="")
        throw new BadRequestError("Name and Amount can not be empty")
    
    req.body.expenseOwner = req.user.id
    const expense = await Expense.findOneAndUpdate({_id:req.params.id, expenseOwner: req.user.id},req.body,{
        new: true,
        runValidators: true
    })

    res.status(StatusCodes.OK).json(expense)
}

module.exports = {
    getAllExpenses,
    getExpense,
    createExpense,
    deleteExpense,
    updateExpense
}