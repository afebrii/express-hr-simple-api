const { oracledb, getConnection } = require("../utils/db");

class RegionRepository {
  async findAll() {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT region_id AS "regionId", region_name AS "regionName" FROM regions`
      );
      return result.rows;
    } finally {
      if (conn) await conn.close();
    }
  }

  async findById(id) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT region_id AS "regionId", region_name AS "regionName" FROM regions WHERE region_id = :id`,
        [id]
      );
      return result.rows[0] || null;
    } finally {
      if (conn) await conn.close();
    }
  }

  async create(regionName) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `INSERT INTO regions (region_name) VALUES (:regionName) RETURNING region_id INTO :id`,
        {
          regionName: regionName,
          id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );
      return { regionId: result.outBinds.id[0], regionName };
    } finally {
      if (conn) await conn.close();
    }
  }

  async update(id, regionName) {
    let conn;
    try {
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
          regionName: regionName,
          id: id,
          out_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          out_name: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );
      if (result.rowsAffected === 0) return null;
      return {
        regionId: result.outBinds.out_id[0],
        regionName: result.outBinds.out_name[0]
      };
    } finally {
      if (conn) await conn.close();
    }
  }

  async delete(id) {
    let conn;
    try {
      conn = await getConnection();
      const sql = `DELETE FROM regions WHERE region_id = :id`;
      const result = await conn.execute(sql, { id }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      if (conn) await conn.close();
    }
  }

  async findAllWithCountries() {
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
      const rows = result.rows; // Array berisi objek hasil query

      // PROSES MAPPING KE NESTED OBJECT (One-to-Many)
      // .reduce() digunakan untuk grouping otomatis berdassarkan region_id
      const nestedData = rows.reduce((acc, row) => {
        // Cari tahu apakah region ini sudah masuk ke dalam akumulator (acc)
        let region = acc.find(item => item.regionId === row.REGION_ID);

        // Jika region belum ada di akumulator, buat objek region baru
        if (!region) {
          region = {
            regionId: row.REGION_ID,
            regionName: row.REGION_NAME,
            countries: [] // conntaine/wadah tuk nampung relasi many
          };
          acc.push(region);
        }

        // Jika kolom country_id tidak null, masukkan ke dalam array countries milik region ini
        if (row.COUNTRY_ID) {
          region.countries.push({
            countryId: row.COUNTRY_ID,
            countryName: row.COUNTRY_NAME
          });
        }

        return acc;
      }, []);

      return nestedData;

    } catch (error) {
      console.error('Error in RegionRepository.findAllWithCountries:', error.message);
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }
}

module.exports = new RegionRepository();
