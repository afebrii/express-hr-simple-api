const oracledb = require("oracledb");
require("dotenv").config();

oracledb.initOracleClient();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function getConnection() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });
    return connection;
  } catch (err) {
    console.error("Koneksi Oracle DB Gagal:", err);
    throw err;
  }
}

module.exports = { oracledb, getConnection };
