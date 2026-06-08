const { getConnection } = require("../../infra/db");

const GetEmployees = async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT employee_id AS "employeeId", first_name AS "firstName", last_name AS "lastName", email, phone_number AS "phoneNumber", hire_date AS "hireDate", job_id AS "jobId", salary, department_id AS "departmentId" FROM employees`
    );
    return res.success("Fetch all data employees", result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = GetEmployees;
