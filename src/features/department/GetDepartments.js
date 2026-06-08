const { getConnection } = require("../../infra/db");

const GetDepartments = async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT department_id AS "departmentId", department_name AS "departmentName" FROM departments`
    );
    return res.success("Fetch all data departments", result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = GetDepartments;
