const oracledb = require("oracledb");
const { getConnection } = require("../../infra/db");
const { BadRequestError } = require("../../infra/AppError");

const CreateRegion = async (req, res, next) => {
  let conn;
  try {
    const { regionName } = req.body;
    if (!regionName || regionName.trim() === '') {
      throw new BadRequestError('Nama region wajib diisi');
    }
    if (regionName.length > 25) {
      throw new BadRequestError('Region name too long! Max 25 characters.');
    }

    conn = await getConnection();
    const result = await conn.execute(
      `INSERT INTO regions (region_id, region_name) VALUES ((SELECT COALESCE(MAX(region_id), 0) + 1 FROM regions), :regionName) RETURNING region_id INTO :id`,
      {
        regionName: regionName.trim(),
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    const data = { regionId: result.outBinds.id[0], regionName: regionName.trim() };
    return res.success("Region created successfully", data);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = CreateRegion;
