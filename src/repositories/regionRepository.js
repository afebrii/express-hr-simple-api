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
}

module.exports = new RegionRepository();
