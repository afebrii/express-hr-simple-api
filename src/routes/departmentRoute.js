const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");
const { validateBody } = require("../middlewares/validateMiddleware");
const { createDepartmentSchema } = require("../validation/departmentValidation");


router.get(`/`, departmentController.findAll);
router.get(`/employees`, departmentController.getDepartmentsWithEmployees);
router.post(`/employees`, departmentController.createEmployees);
router.get(`/:id`, departmentController.findById);
router.post(`/`, validateBody(createDepartmentSchema), departmentController.create);
router.put(`/:id`, departmentController.update);
router.delete(`/:id`, departmentController.remove);

module.exports = router;