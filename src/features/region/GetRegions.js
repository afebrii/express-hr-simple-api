const { getConnection } = require("../../infra/db");

const GetRegions = async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT region_id AS "regionId", region_name AS "regionName" FROM regions`
    );
    return res.success("Fetch all data regions", result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = GetRegions;
