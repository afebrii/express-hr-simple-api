const express = require("express");
const router = express.Router();

const departmentRoutes = require("./department/department.routes");
const regionRoutes = require("./region/region.routes");
const countryRoutes = require("./country/country.routes");
const employeeRoutes = require("./employee/employee.routes");
const usersRoutes = require("./users/users.routes");

router.use("/departments", departmentRoutes);
router.use("/regions", regionRoutes);
router.use("/countries", countryRoutes);
router.use("/employees", employeeRoutes);
router.use("/users", usersRoutes);

module.exports = router;
