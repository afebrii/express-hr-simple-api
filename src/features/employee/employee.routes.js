const express = require("express");
const router = express.Router();

const GetEmployees = require("./GetEmployees");
const CreateEmployee = require("./CreateEmployee");

router.get("/", GetEmployees);
router.post("/", CreateEmployee);

module.exports = router;
