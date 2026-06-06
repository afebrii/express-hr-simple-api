const departmentRepository = require("../repositories/departmentRepository");
const employeeRepository = require("../repositories/employeeRepository");
const { BadRequestError, NotFoundError } = require("../utils/customError");
const { getConnection } = require("../utils/db");

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

  async getAllDepartmentsWithEmployees() {
    const departments = await departmentRepository.findAllWithEmployees();

    if (!departments || departments.length === 0) {
      throw new NotFoundError('No departments or employees found in the database.');
    }

    return departments;
  }

  async addEmployeesToDepartment(departmentId, employees) {
    // 1. Validasi Input Awal
    if (!departmentId) {
      throw new BadRequestError('Department ID is required.');
    }
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      throw new BadRequestError('Employees must be a non-empty array.');
    }

    // Validasi data setiap employee
    for (const emp of employees) {
      if (!emp.lastName || !emp.email || !emp.hireDate || !emp.jobId) {
        throw new BadRequestError('Each employee must have lastName, email, hireDate, and jobId.');
      }
    }

    // Pastikan department ada
    const department = await departmentRepository.findById(Number(departmentId));
    if (!department) {
      throw new NotFoundError(`Department dengan ID ${departmentId} tidak ditemukan.`);
    }

    let conn;
    try {
      // 2. Create connection 
      conn = await getConnection();

      // 3. Call repository untuk melakukan proses looping insert
      await employeeRepository.insertBulk(conn, departmentId, employees);

      // 4. COMMIT data ke Oracle DB
      await conn.commit();

      // return data respons API
      return { departmentId, totalInserted: employees.length, employees };

    } catch (error) {
      // 5. Jika ada error, rollback semuanya!
      if (conn) {
        console.error('Transaction failed. Rolling back changes...');
        await conn.rollback();
      }

      // Jika ada error constraint dari oracle, bungkus dengan BadRequestError 
      if (error.message.includes('ORA-00001')) {
        throw new BadRequestError('One of the Employee Emails already exists (Duplicate Email).');
      }

      throw error; // lempar ke global handler
    } finally {
      // 6. Pastikan koneksi selalu di close
      if (conn) await conn.close();
    }
  }
}

module.exports = new DepartmentService();
