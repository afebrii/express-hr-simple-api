const express = require("express");
const router = express.Router();

const GetCountries = require("./GetCountries");
const GetCountryById = require("./GetCountryById");
const CreateCountry = require("./CreateCountry");
const UpdateCountry = require("./UpdateCountry");
const DeleteCountry = require("./DeleteCountry");

router.get("/", GetCountries);
router.get("/:id", GetCountryById);
router.post("/", CreateCountry);
router.put("/:id", UpdateCountry);
router.delete("/:id", DeleteCountry);

module.exports = router;
