const { getConnection } = require("../../infra/db");
const { BadRequestError, NotFoundError } = require("../../infra/AppError");

const GetCountryById = async (req, res, next) => {
  let conn;
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw new BadRequestError("ID country tidak valid.");
    }
    const cleanId = id.trim().toUpperCase();

    conn = await getConnection();
    const result = await conn.execute(
      `SELECT country_id AS "countryId", country_name AS "countryName", region_id AS "regionId" FROM countries WHERE country_id = :id`,
      [cleanId]
    );
    const country = result.rows[0] || null;

    if (!country) {
      throw new NotFoundError(`Country dengan ID ${cleanId} tidak ditemukan.`);
    }

    return res.success("Country retrieved successfully", country);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = GetCountryById;
