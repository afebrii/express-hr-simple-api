const express = require("express");
const router = express.Router();

const countryController = require("../controllers/countryController");

router.get(`/`, countryController.findAll);
router.get(`/:id`, countryController.findById);
router.post(`/`, countryController.create);
router.put(`/:id`, countryController.update);
router.delete(`/:id`, countryController.remove);

module.exports = router;
