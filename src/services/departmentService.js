const departmentRepository = require("../repositories/departmentRepository");
const { BadRequestError, NotFoundError } = require("../utils/customError");

class DepartmentService {
  async getAllDepartments() {
    return await departmentRepository.findAll();
  }

  async getDepartmentById(id) {
    const department = await departmentRepository.findById(id);
    if (!department) {
      // const error = new Error(`Department with ID ${id} not found.`);
      // error.statusCode = 404;
      // throw error;

      throw new NotFoundError(`Department with ID ${id} not found.`);
    }
    return department;
  }

  async createDepartment(departmentName) {
    // VALIDASI: departmentname ga boleh kosong dan max length 50 karakter
    if (!departmentName) {
      // const error = new Error('Nama department wajib diisi');
      // error.statusCode = 400;
      // throw error;

      throw new BadRequestError('Nama department wajib diisi');
    }
    if (departmentName.length > 50) {
      // const error = new Error('Department length name too long! Max 50 characters.');
      // error.statusCode = 400;
      // throw error;

      throw new BadRequestError('Department length name too long! Max 50 characters.');
    }
    return await departmentRepository.create(departmentName);
  }

  async updateDepartment(id, data) {
    // 1. Validasi Input Bisnis
    if (!data.departmentName || data.departmentName.trim() === '') {
      // const error = new Error('Nama department tidak boleh kosong!');
      // error.statusCode = 400;
      // throw error;

      throw new BadRequestError('Nama department tidak boleh kosong!');
    }
    // 2. Eksekusi ke Repository
    const updatedDepartment = await departmentRepository.update(id, data.departmentName);

    // 3. Jika data tidak ditemukan di DB Oracle
    if (!updatedDepartment) {
      // const error = new Error(`Department dengan ID ${id} tidak ditemukan`);
      // error.statusCode = 401;
      // throw error;

      throw new NotFoundError(`Department dengan ID ${id} tidak ditemukan`);
    }
    return updatedDepartment;
  }

  async deleteDepartment(id) {
    const isDeleted = await departmentRepository.delete(id);
    if (!isDeleted) {
      // const error = new Error(`Department dengan ID ${id} tidak ditemukan`);
      // error.statusCode = 401;
      // throw error;

      throw new NotFoundError(`Department dengan ID ${id} tidak ditemukan`);
    }
    return true;
  }
}

module.exports = new DepartmentService();
