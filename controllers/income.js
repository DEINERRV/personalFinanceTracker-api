const Income = require("../models/Income");
const {StatusCodes} = require("http-status-codes");
const {BadRequestError} = require("../errors/");

const getAllIncomes = async(req,res)=>{
    const queryObject = {}
    const [name,dateFilters,numericFilters,sort,fields] = req.query;
    queryObject.owner = req.user.id;


    //filters
    if(name)
        queryObject.name = {$regex: name, $options: "i"};
    //Special filters type
    const operatorMap = {
        ">":"$gt",
        ">=":"$gte",
        "&lt;":"$lt",
        "&lt;=":"$lte",
        "=":"$eq"
    }
    const regEx = /\b(&lt;|>|=|>=|&lt;=)\b/g;
    //Dates
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
    //Numbers
    if(numericFilters){
        let filter = numericFilters.replace(regEx,(e)=>`-${operatorMap[e]}-`);
        filter = filter.split(",").forEach(e => {
            const [field,operator,value] = e.split("-");
            if(field === "amount")
                queryObject[field] = {...queryObject[field],[operator]:Number(value)};
        });
    }


    let result = Income.find(queryObject);
    
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
    const incomes = await result;
    res.status(200).json({incomes,amount: incomes.length});
}

const getIncome = async(req,res)=>{
    const income = await Income.find({_id: req.params.id, owner: req.user.id})
    if(!income)
        throw new BadRequestError(`No income with id: ${req.params.id}`)
    
    res.status(StatusCodes.OK).json(icome)
}

const createIncome = async(req,res)=>{
    req.body.owner = req.user.id;
    const income = await Income.create(req.body);
    res.status(StatusCodes.CREATED).json(income);
}

const deleteIncome = async(req,res)=>{
    const income = await Income.findOneAndDelete({owner:req.user.id, _id: req.params.id});
    if(!income)
        throw new BadRequestError(`No income with id: ${req.params.id}`);
    
    res.status(StatusCodes.OK).json(expense)
}

const updateIncome = async(req,res)=>{
    const {name,amount,} = req.body

    if(!name || !amount || name=="")
        throw new BadRequestError("Name and Amount can not be empty")
    
    const income = await Income.findOneAndUpdate({owner:req.user.id, _id:req.params.id},req.body,{
        new: true,
        runValidators: true
    })

    res.status(StatusCodes.OK).json(income)
}


module.exports = {
    getAllIncomes,
    getIncome,
    createIncome,
    deleteIncome,
    updateIncome
}