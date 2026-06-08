const { getConnection } = require("../../infra/db");
const { BadRequestError, NotFoundError } = require("../../infra/AppError");

const CreateDepartmentEmployees = async (req, res, next) => {
  let conn;
  try {
    const { departmentId, employees } = req.body;

    if (!departmentId) {
      throw new BadRequestError('Department ID is required.');
    }
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      throw new BadRequestError('Employees must be a non-empty array.');
    }

    for (const emp of employees) {
      if (!emp.lastName || !emp.email || !emp.hireDate || !emp.jobId) {
        throw new BadRequestError('Each employee must have lastName, email, hireDate, and jobId.');
      }
    }

    conn = await getConnection();

    // Verify department exists
    const deptResult = await conn.execute(
      `SELECT department_id FROM departments WHERE department_id = :id`,
      [Number(departmentId)]
    );
    if (!deptResult.rows[0]) {
      throw new NotFoundError(`Department dengan ID ${departmentId} tidak ditemukan.`);
    }

    const query = `
      INSERT INTO employees (
        employee_id, 
        first_name, 
        last_name, 
        email, 
        phone_number, 
        hire_date, 
        job_id, 
        salary, 
        department_id
      ) 
      VALUES (
        employees_seq.NEXTVAL, 
        :firstName, 
        :lastName, 
        :email, 
        :phoneNumber, 
        TO_DATE(:hireDate, 'YYYY-MM-DD'), 
        :jobId, 
        :salary, 
        :departmentId
      )
    `;

    for (const employee of employees) {
      await conn.execute(query, {
        firstName: employee.firstName || null,
        lastName: employee.lastName,
        email: employee.email,
        phoneNumber: employee.phoneNumber || null,
        hireDate: employee.hireDate,
        jobId: employee.jobId,
        salary: employee.salary ? Number(employee.salary) : null,
        departmentId: Number(departmentId)
      });
    }

    await conn.commit();

    const data = { departmentId, totalInserted: employees.length, employees };
    return res.success('Employees successfully added to the department.', data, 201);
  } catch (error) {
    if (conn) {
      console.error('Transaction failed. Rolling back changes...');
      await conn.rollback();
    }

    if (error.message.includes('ORA-00001')) {
      throw new BadRequestError('One of the Employee Emails already exists (Duplicate Email).');
    }

    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = CreateDepartmentEmployees;
