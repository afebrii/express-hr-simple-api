const oracledb = require("oracledb");
const { getConnection } = require("../../infra/db");
const { BadRequestError } = require("../../infra/AppError");

const CreateDepartment = async (req, res, next) => {
  let conn;
  try {
    const { departmentName } = req.body;
    if (!departmentName) {
      throw new BadRequestError('Nama department wajib diisi');
    }
    if (departmentName.length > 50) {
      throw new BadRequestError('Department length name too long! Max 50 characters.');
    }

    conn = await getConnection();
    const result = await conn.execute(
      `INSERT INTO departments (department_id, department_name) VALUES (departments_seq.NEXTVAL, :departmentName) RETURNING department_id INTO :id`,
      {
        departmentName: departmentName.trim(),
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    const data = { departmentId: result.outBinds.id[0], departmentName: departmentName.trim() };
    return res.success("Department created successfully", data);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = CreateDepartment;
