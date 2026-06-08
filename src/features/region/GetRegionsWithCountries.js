const { getConnection } = require("../../infra/db");
const { NotFoundError } = require("../../infra/AppError");

const GetRegionsWithCountries = async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();

    const query = `
      SELECT 
          r.region_id, 
          r.region_name, 
          c.country_id, 
          c.country_name 
      FROM regions r
      LEFT JOIN countries c ON r.region_id = c.region_id
      ORDER BY r.region_id
    `;

    const result = await conn.execute(query);
    const rows = result.rows;

    const nestedData = rows.reduce((acc, row) => {
      let region = acc.find(item => item.regionId === row.REGION_ID);

      if (!region) {
        region = {
          regionId: row.REGION_ID,
          regionName: row.REGION_NAME,
          countries: []
        };
        acc.push(region);
      }

      if (row.COUNTRY_ID) {
        region.countries.push({
          countryId: row.COUNTRY_ID,
          countryName: row.COUNTRY_NAME
        });
      }

      return acc;
    }, []);

    if (nestedData.length === 0) {
      throw new NotFoundError('No regions or countries found in the database.');
    }

    return res.success('Regions with countries retrieved successfully.', nestedData, 200);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = GetRegionsWithCountries;
