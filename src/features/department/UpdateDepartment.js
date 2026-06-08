const oracledb = require("oracledb");
const { getConnection } = require("../../infra/db");
const { BadRequestError, NotFoundError } = require("../../infra/AppError");

const UpdateDepartment = async (req, res, next) => {
  let conn;
  try {
    const { id } = req.params;
    const { departmentName } = req.body;

    if (!departmentName || departmentName.trim() === '') {
      throw new BadRequestError('Nama department tidak boleh kosong!');
    }

    conn = await getConnection();
    const sql = `
      UPDATE departments 
      SET department_name = :departmentName 
      WHERE department_id = :id 
      RETURNING department_id, department_name INTO :out_id, :out_name
    `;
    const result = await conn.execute(
      sql,
      {
        departmentName: departmentName.trim(),
        id: Number(id),
        out_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        out_name: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      throw new NotFoundError(`Department dengan ID ${id} tidak ditemukan`);
    }

    const data = {
      departmentId: result.outBinds.out_id[0],
      departmentName: result.outBinds.out_name[0]
    };

    return res.success("Department updated successfully", data);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = UpdateDepartment;
