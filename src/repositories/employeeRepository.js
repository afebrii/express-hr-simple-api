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
}

module.exports = new EmployeeRepository();
