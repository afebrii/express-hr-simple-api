const { getConnection } = require("../../infra/db");
const { BadRequestError } = require("../../infra/AppError");

const CreateRegionCountries = async (req, res, next) => {
  let conn;
  try {
    const { regionId, countries } = req.body;

    if (!regionId) {
      throw new BadRequestError('Region ID is required.');
    }
    if (!countries || !Array.isArray(countries) || countries.length === 0) {
      throw new BadRequestError('Countries must be a non-empty array.');
    }

    conn = await getConnection();

    const query = `
      INSERT INTO countries (country_id, country_name, region_id) 
      VALUES (:countryId, :countryName, :regionId)
    `;

    for (const country of countries) {
      await conn.execute(query, {
        countryId: country.countryId,
        countryName: country.countryName,
        regionId: Number(regionId)
      });
    }

    await conn.commit();

    const data = { regionId, totalInserted: countries.length, countries };
    return res.success('Countries successfully added to the region.', data, 201);
  } catch (error) {
    if (conn) {
      console.error('Transaction failed. Rolling back changes...');
      await conn.rollback();
    }

    if (error.message.includes('ORA-00001')) {
      throw new BadRequestError('One of the Country IDs already exists (Duplicate Primary Key).');
    }

    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = CreateRegionCountries;
