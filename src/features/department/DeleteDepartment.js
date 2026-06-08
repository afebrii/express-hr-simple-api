const { getConnection } = require("../../infra/db");
const { NotFoundError } = require("../../infra/AppError");

const DeleteDepartment = async (req, res, next) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await getConnection();
    const sql = `DELETE FROM departments WHERE department_id = :id`;
    const result = await conn.execute(sql, { id: Number(id) }, { autoCommit: true });

    if (result.rowsAffected === 0) {
      throw new NotFoundError(`Department dengan ID ${id} tidak ditemukan`);
    }

    return res.success("Department deleted successfully", null);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = DeleteDepartment;
