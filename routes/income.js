const express = require("express");
const router = express.Router();

const {getAllIncomes,getIncome,createIncome,deleteIncome,updateIncome} = require("../controllers/income");

router.route("/")
    .get(getAllIncomes)
    .post(createIncome)
;

router.route("/:id")
    .get(getIncome)
    .patch(updateIncome)
    .delete(deleteIncome)
;

module.exports = router;