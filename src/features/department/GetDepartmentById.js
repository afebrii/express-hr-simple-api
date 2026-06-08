const { getConnection } = require("../../infra/db");
const { NotFoundError } = require("../../infra/AppError");

const GetDepartmentById = async (req, res, next) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT department_id AS "departmentId", department_name AS "departmentName" FROM departments WHERE department_id = :id`,
      [Number(id)]
    );
    const department = result.rows[0] || null;

    if (!department) {
      throw new NotFoundError(`Department with ID ${id} not found.`);
    }

    return res.success("Departments retrieved successfully", department);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = GetDepartmentById;
