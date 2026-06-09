const { oracledb, getConnection } = require("../utils/db");

class EmployeeRepository {
  async insertBulk(conn, departmentId, employees) {
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
        hireDate: employee.hireDate, // format: 'YYYY-MM-DD'
        jobId: employee.jobId,
        salary: employee.salary ? Number(employee.salary) : null,
        departmentId: Number(departmentId)
      });
    }
  }
  async findById(id) {
    let conn;
    try {
      conn = await getConnection();
      const query = `SELECT employee_id AS "employeeId", first_name AS "firstName", last_name AS "lastName" FROM employees WHERE employee_id = :id`;
      const result = await conn.execute(query, [Number(id)]);
      return result.rows[0] || null;
    } finally {
      if (conn) await conn.close();
    }
  }
}

module.exports = new EmployeeRepository();
