const express = require("express");
const router = express.Router();

const regionController = require("../controllers/regionController");
const { validateBody } = require("../middlewares/validateMiddleware");
const { createRegionCountriesSchema } = require("../validation/regionValidation");

router.get(`/`, regionController.findAll);
router.get(`/countries`, regionController.getRegionsWithCountries);
router.post(`/countries`, validateBody(createRegionCountriesSchema), regionController.createCountries);
router.get(`/:id`, regionController.findById);
router.post(`/`, regionController.create);
router.put(`/:id`, regionController.update);
router.delete(`/:id`, regionController.remove);

module.exports = router;
