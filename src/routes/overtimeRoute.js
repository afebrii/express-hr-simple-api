const express = require("express");
const router = express.Router();

const overtimeController = require("../controllers/overtimeController");
const { validateBody } = require("../middlewares/validateMiddleware");
const { 
  createOvertimeSchema, 
  updateOvertimeSchema, 
  approveOvertimeSchema 
} = require("../validation/overtimeValidation");

router.get("/", overtimeController.findAll);
router.get("/:id", overtimeController.findById);
router.post("/", validateBody(createOvertimeSchema), overtimeController.create);
router.put("/:id", validateBody(updateOvertimeSchema), overtimeController.update);
router.patch("/:id/approve", validateBody(approveOvertimeSchema), overtimeController.approve);
router.delete("/:id", overtimeController.remove);

module.exports = router;
