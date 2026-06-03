const departmentService = require("../services/departmentService");

class DepartmentController {
  async findAll(req, res, next) {
    try {
      const data = await departmentService.getAllDepartments();

      return res.success("Fetch all data departments", data);
    } catch (error) {}
  }

  async findById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await departmentService.getDepartmentById(id);

      return res.success("Departments retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepartmentController();
