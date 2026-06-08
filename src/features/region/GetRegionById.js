const { getConnection } = require("../../infra/db");
const { NotFoundError } = require("../../infra/AppError");

const GetRegionById = async (req, res, next) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT region_id AS "regionId", region_name AS "regionName" FROM regions WHERE region_id = :id`,
      [Number(id)]
    );
    const region = result.rows[0] || null;

    if (!region) {
      throw new NotFoundError(`Region with ID ${id} not found.`);
    }

    return res.success("Region retrieved successfully", region);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = GetRegionById;
