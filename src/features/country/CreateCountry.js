const oracledb = require("oracledb");
const { getConnection } = require("../../infra/db");
const { BadRequestError, ConflictError } = require("../../infra/AppError");

const CreateCountry = async (req, res, next) => {
  let conn;
  try {
    const { countryId, countryName, regionId } = req.body;

    // Validation countryId
    if (!countryId || typeof countryId !== "string" || countryId.trim() === "") {
      throw new BadRequestError("ID country wajib diisi");
    }
    const cleanCountryId = countryId.trim().toUpperCase();
    if (cleanCountryId.length !== 2) {
      throw new BadRequestError("Country ID harus berupa 2 karakter.");
    }

    // Validation countryName
    if (!countryName || typeof countryName !== "string" || countryName.trim() === "") {
      throw new BadRequestError("Nama country wajib diisi");
    }
    const cleanCountryName = countryName.trim();
    if (cleanCountryName.length > 40) {
      throw new BadRequestError("Country name too long! Max 40 characters.");
    }

    // Validation regionId
    if (regionId === undefined || regionId === null || isNaN(Number(regionId))) {
      throw new BadRequestError("ID region wajib diisi dan berupa angka");
    }

    conn = await getConnection();

    // Verify region exists
    const regionResult = await conn.execute(
      `SELECT region_id AS "regionId", region_name AS "regionName" FROM regions WHERE region_id = :id`,
      [Number(regionId)]
    );
    const region = regionResult.rows[0] || null;
    if (!region) {
      throw new BadRequestError(`Region dengan ID ${regionId} tidak ditemukan.`);
    }

    // Check if duplicate country ID
    const existingResult = await conn.execute(
      `SELECT country_id AS "countryId" FROM countries WHERE country_id = :id`,
      [cleanCountryId]
    );
    if (existingResult.rows[0]) {
      throw new ConflictError(`Country dengan ID ${cleanCountryId} sudah terdaftar.`);
    }

    // Insert country
    const sql = `
      INSERT INTO countries (country_id, country_name, region_id) 
      VALUES (:countryId, :countryName, :regionId)
      RETURNING country_id, country_name, region_id INTO :out_id, :out_name, :out_region_id
    `;
    const result = await conn.execute(
      sql,
      {
        countryId: cleanCountryId,
        countryName: cleanCountryName,
        regionId: Number(regionId),
        out_id: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        out_name: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        out_region_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    const data = {
      countryId: result.outBinds.out_id[0],
      countryName: result.outBinds.out_name[0],
      regionId: result.outBinds.out_region_id[0]
    };

    return res.success("Country created successfully", data);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = CreateCountry;
