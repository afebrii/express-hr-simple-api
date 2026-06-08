const express = require("express");
const router = express.Router();

const { validateBody } = require("../../infra/validateMiddleware");
const { createDepartmentSchema } = require("../../infra/validation/departmentValidation");

const GetDepartments = require("./GetDepartments");
const GetDepartmentById = require("./GetDepartmentById");
const CreateDepartment = require("./CreateDepartment");
const UpdateDepartment = require("./UpdateDepartment");
const DeleteDepartment = require("./DeleteDepartment");
const GetDepartmentsWithEmployees = require("./GetDepartmentsWithEmployees");
const CreateDepartmentEmployees = require("./CreateDepartmentEmployees");

router.get("/", GetDepartments);
router.get("/employees", GetDepartmentsWithEmployees);
router.post("/employees", CreateDepartmentEmployees);
router.get("/:id", GetDepartmentById);
router.post("/", validateBody(createDepartmentSchema), CreateDepartment);
router.put("/:id", UpdateDepartment);
router.delete("/:id", DeleteDepartment);

module.exports = router;
