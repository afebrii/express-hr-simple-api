const oracledb = require("oracledb");
const { getConnection } = require("../../infra/db");
const { BadRequestError, NotFoundError } = require("../../infra/AppError");

const UpdateCountry = async (req, res, next) => {
  let conn;
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw new BadRequestError("ID country tidak valid.");
    }
    const cleanId = id.trim().toUpperCase();

    const { countryName, regionId } = req.body;

    // Validation countryName
    if (!countryName || typeof countryName !== "string" || countryName.trim() === "") {
      throw new BadRequestError("Nama country tidak boleh kosong!");
    }
    const cleanCountryName = countryName.trim();
    if (cleanCountryName.length > 40) {
      throw new BadRequestError("Country name too long! Max 40 characters.");
    }

    // Validation regionId
    if (regionId === undefined || regionId === null || isNaN(Number(regionId))) {
      throw new BadRequestError("ID region tidak boleh kosong dan harus berupa angka!");
    }

    conn = await getConnection();

    // Check if country exists
    const countryResult = await conn.execute(
      `SELECT country_id AS "countryId" FROM countries WHERE country_id = :id`,
      [cleanId]
    );
    if (!countryResult.rows[0]) {
      throw new NotFoundError(`Country dengan ID ${cleanId} tidak ditemukan.`);
    }

    // Verify region exists
    const regionResult = await conn.execute(
      `SELECT region_id AS "regionId" FROM regions WHERE region_id = :id`,
      [Number(regionId)]
    );
    if (!regionResult.rows[0]) {
      throw new BadRequestError(`Region dengan ID ${regionId} tidak ditemukan.`);
    }

    // Update country
    const sql = `
      UPDATE countries 
      SET country_name = :countryName, region_id = :regionId 
      WHERE country_id = :id 
      RETURNING country_id, country_name, region_id INTO :out_id, :out_name, :out_region_id
    `;
    const result = await conn.execute(
      sql,
      {
        countryName: cleanCountryName,
        regionId: Number(regionId),
        id: cleanId,
        out_id: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        out_name: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        out_region_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      throw new NotFoundError(`Country dengan ID ${cleanId} tidak ditemukan`);
    }

    const data = {
      countryId: result.outBinds.out_id[0],
      countryName: result.outBinds.out_name[0],
      regionId: result.outBinds.out_region_id[0]
    };

    return res.success("Country updated successfully", data);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = UpdateCountry;
