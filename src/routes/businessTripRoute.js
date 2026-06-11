const express = require("express");
const router = express.Router();

const businessTripController = require("../controllers/businessTripController");

router.get("/", businessTripController.findAll);
router.get("/:id", businessTripController.findById);
router.post("/", businessTripController.create);
router.put("/:id", businessTripController.update);
router.patch("/:id/approve", businessTripController.approve);
router.patch("/:id/process", businessTripController.process);
router.post("/:id/evidences", businessTripController.uploadEvidence);
router.delete("/:id", businessTripController.remove);

module.exports = router;
