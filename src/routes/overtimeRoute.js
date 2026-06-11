const express = require("express");
const router = express.Router();

const overtimeController = require("../controllers/overtimeController");

router.get("/", overtimeController.findAll);
router.get("/:id", overtimeController.findById);
router.post("/", overtimeController.create);
router.put("/:id", overtimeController.update);
router.patch("/:id/approve", overtimeController.approve);
router.delete("/:id", overtimeController.remove);

module.exports = router;
