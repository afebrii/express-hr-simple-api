const departmentRepository = require("../repositories/departmentRepository");

class DepartmentService {
  async getAllDepartments() {
    return await departmentRepository.findAll();
  }

  async getDepartmentById(id) {
    const department = await departmentRepository.findById(id);
    if (!department) {
      const error = new Error(`Department with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return department;
  }

  
}

module.exports = new DepartmentService();
