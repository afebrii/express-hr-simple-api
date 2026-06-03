const { oracledb, getConnection } = require("../utils/db");

class CountryRepository {
  async findAll() {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT country_id AS "countryId", country_name AS "countryName", region_id AS "regionId" FROM countries`
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
        `SELECT country_id AS "countryId", country_name AS "countryName", region_id AS "regionId" FROM countries WHERE country_id = :id`,
        [id]
      );
      return result.rows[0] || null;
    } finally {
      if (conn) await conn.close();
    }
  }

  async create(countryId, countryName, regionId) {
    let conn;
    try {
      conn = await getConnection();
      const sql = `
        INSERT INTO countries (country_id, country_name, region_id) 
        VALUES (:countryId, :countryName, :regionId)
        RETURNING country_id, country_name, region_id INTO :out_id, :out_name, :out_region_id
      `;
      const result = await conn.execute(
        sql,
        {
          countryId: countryId,
          countryName: countryName,
          regionId: regionId,
          out_id: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
          out_name: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
          out_region_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );
      return {
        countryId: result.outBinds.out_id[0],
        countryName: result.outBinds.out_name[0],
        regionId: result.outBinds.out_region_id[0]
      };
    } finally {
      if (conn) await conn.close();
    }
  }

  async update(id, countryName, regionId) {
    let conn;
    try {
      conn = await getConnection();
      const sql = `
        UPDATE countries 
        SET country_name = :countryName, region_id = :regionId 
        WHERE country_id = :id 
        RETURNING country_id, country_name, region_id INTO :out_id, :out_name, :out_region_id
      `;
      const result = await conn.execute(
        sql,
        {
          countryName: countryName,
          regionId: regionId,
          id: id,
          out_id: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
          out_name: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
          out_region_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );
      if (result.rowsAffected === 0) return null;
      return {
        countryId: result.outBinds.out_id[0],
        countryName: result.outBinds.out_name[0],
        regionId: result.outBinds.out_region_id[0]
      };
    } finally {
      if (conn) await conn.close();
    }
  }

  async delete(id) {
    let conn;
    try {
      conn = await getConnection();
      const sql = `DELETE FROM countries WHERE country_id = :id`;
      const result = await conn.execute(sql, { id }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      if (conn) await conn.close();
    }
  }
}

module.exports = new CountryRepository();
