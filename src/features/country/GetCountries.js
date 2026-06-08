const { getConnection } = require("../../infra/db");

const GetCountries = async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT country_id AS "countryId", country_name AS "countryName", region_id AS "regionId" FROM countries`
    );
    return res.success("Fetch all data countries", result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = GetCountries;
