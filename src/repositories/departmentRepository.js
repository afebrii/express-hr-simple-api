const { oracledb, getConnection } = require("../utils/db");

class DepartmentRepository {
  async findAll() {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT department_id AS "departmentId", department_name AS "departmentName" FROM departments`,
      );
      return result.rows;
    } finally {
      if (conn) await conn.close();
    }
  }

  async findById(id) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT department_id AS "departmentId", department_name AS "departmentName" FROM departments WHERE department_id = :id`,
        [id],
      );
      return result.rows[0] || null;
    } finally {
      if (conn) await conn.close();
    }
  }
}

module.exports = new DepartmentRepository();
