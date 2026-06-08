const oracledb = require("oracledb");
const { getConnection } = require("../../infra/db");
const { BadRequestError, NotFoundError } = require("../../infra/AppError");

const UpdateRegion = async (req, res, next) => {
  let conn;
  try {
    const { id } = req.params;
    const { regionName } = req.body;

    if (!regionName || regionName.trim() === '') {
      throw new BadRequestError('Nama region tidak boleh kosong!');
    }
    if (regionName.length > 25) {
      throw new BadRequestError('Region name too long! Max 25 characters.');
    }

    conn = await getConnection();
    const sql = `
      UPDATE regions 
      SET region_name = :regionName 
      WHERE region_id = :id 
      RETURNING region_id, region_name INTO :out_id, :out_name
    `;
    const result = await conn.execute(
      sql,
      {
        regionName: regionName.trim(),
        id: Number(id),
        out_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        out_name: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      throw new NotFoundError(`Region dengan ID ${id} tidak ditemukan`);
    }

    const data = {
      regionId: result.outBinds.out_id[0],
      regionName: result.outBinds.out_name[0]
    };

    return res.success("Region updated successfully", data);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = UpdateRegion;
