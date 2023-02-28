require('dotenv').config();
require('express-async-errors');
const morgan = require("morgan");

const express = require('express');
const app = express();

// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// connectDB
const connectDB = require("./db/connect");

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
// auth middleware export
const authenticateUser = require("./middleware/authentication");

// routers
const authRouter = require("./routes/auth");
const expenseRouter = require("./routes/expense");
const incomeRouter =require("./routes/income");

// swagger

// settings
app.set("port",process.env.PORT || 3000);
app.set("appName","Job API");
app.set("trust proxy",1);

// middlewares
app.use(rateLimiter({
  windoMS: 15 * 60 * 1000,//15 min
  max: 100
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// routes
app.get("/", (req,res)=>res.send("<h1>PERSONAL FINANCE TRACKER API<h1>"));
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/expenses",authenticateUser, expenseRouter);
app.use("/api/v1/incomes",authenticateUser, incomeRouter);

// more middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


//Connect to the DB and then start the server
const start = async()=>{
  try{
      console.log("Connecting to the DB...");
      await connectDB(process.env.MONGO_URL);
      console.log("Connected to the DB");
      app.listen(app.get("port"));
      console.log(`App(${app.get("appName")}) listening on port ${app.get("port")}`);
  }
  catch(err){
      console.log(err);
  }
}
start();