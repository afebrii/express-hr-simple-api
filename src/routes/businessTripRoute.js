const express = require("express");
const router = express.Router();

const businessTripController = require("../controllers/businessTripController");
const { validateBody } = require("../middlewares/validateMiddleware");
const { 
  createBusinessTripSchema, 
  updateBusinessTripSchema, 
  approveBusinessTripSchema,
  processBusinessTripSchema,
  uploadEvidenceSchema
} = require("../validation/businessTripValidation");

router.get("/", businessTripController.findAll);
router.get("/:id", businessTripController.findById);
router.post("/", validateBody(createBusinessTripSchema), businessTripController.create);
router.put("/:id", validateBody(updateBusinessTripSchema), businessTripController.update);
router.patch("/:id/approve", validateBody(approveBusinessTripSchema), businessTripController.approve);
router.patch("/:id/process", validateBody(processBusinessTripSchema), businessTripController.process);
router.post("/:id/evidences", validateBody(uploadEvidenceSchema), businessTripController.uploadEvidence);
router.delete("/:id", businessTripController.remove);

module.exports = router;
