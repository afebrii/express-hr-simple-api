const { getConnection } = require("../../infra/db");
const { NotFoundError } = require("../../infra/AppError");

const GetDepartmentsWithEmployees = async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();

    const query = `
      SELECT 
          d.department_id, 
          d.department_name, 
          e.employee_id, 
          e.first_name, 
          e.last_name,
          e.email,
          e.phone_number,
          e.hire_date,
          e.job_id,
          e.salary
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id
      ORDER BY d.department_id
    `;

    const result = await conn.execute(query);
    const rows = result.rows;

    const nestedData = rows.reduce((acc, row) => {
      let dept = acc.find(item => item.departmentId === row.DEPARTMENT_ID);

      if (!dept) {
        dept = {
          departmentId: row.DEPARTMENT_ID,
          departmentName: row.DEPARTMENT_NAME,
          employees: []
        };
        acc.push(dept);
      }

      if (row.EMPLOYEE_ID) {
        dept.employees.push({
          employeeId: row.EMPLOYEE_ID,
          firstName: row.FIRST_NAME,
          lastName: row.LAST_NAME,
          email: row.EMAIL,
          phoneNumber: row.PHONE_NUMBER,
          hireDate: row.HIRE_DATE,
          jobId: row.JOB_ID,
          salary: row.SALARY
        });
      }

      return acc;
    }, []);

    if (nestedData.length === 0) {
      throw new NotFoundError('No departments or employees found in the database.');
    }

    return res.success('Departments with employees retrieved successfully.', nestedData, 200);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = GetDepartmentsWithEmployees;
