const express = require("express");
const router = express.Router();

const { validateBody } = require("../../infra/validateMiddleware");
const { createRegionCountriesSchema } = require("../../infra/validation/regionValidation");

const GetRegions = require("./GetRegions");
const GetRegionById = require("./GetRegionById");
const CreateRegion = require("./CreateRegion");
const UpdateRegion = require("./UpdateRegion");
const DeleteRegion = require("./DeleteRegion");
const GetRegionsWithCountries = require("./GetRegionsWithCountries");
const CreateRegionCountries = require("./CreateRegionCountries");

router.get("/", GetRegions);
router.get("/countries", GetRegionsWithCountries);
router.post("/countries", validateBody(createRegionCountriesSchema), CreateRegionCountries);
router.get("/:id", GetRegionById);
router.post("/", CreateRegion);
router.put("/:id", UpdateRegion);
router.delete("/:id", DeleteRegion);

module.exports = router;
