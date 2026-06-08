const { getConnection } = require("../../infra/db");
const { BadRequestError, NotFoundError } = require("../../infra/AppError");

const DeleteCountry = async (req, res, next) => {
  let conn;
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw new BadRequestError("ID country tidak valid.");
    }
    const cleanId = id.trim().toUpperCase();

    conn = await getConnection();
    const sql = `DELETE FROM countries WHERE country_id = :id`;
    const result = await conn.execute(sql, { id: cleanId }, { autoCommit: true });

    if (result.rowsAffected === 0) {
      throw new NotFoundError(`Country dengan ID ${cleanId} tidak ditemukan`);
    }

    return res.success("Country deleted successfully", null);
  } catch (error) {
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = DeleteCountry;
