const express = require("express");
const router = express.Router();

const GetUsers = require("./GetUsers");
const CreateUser = require("./CreateUser");

router.get("/", GetUsers);
router.post("/", CreateUser);

module.exports = router;
