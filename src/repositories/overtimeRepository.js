const { oracledb, getConnection } = require("../utils/db");

class OvertimeRepository {
  async findAll(filters = {}) {
    let conn;
    try {
      conn = await getConnection();
      
      let query = `
        SELECT 
          o.overtime_id AS "overtimeId", 
          o.employee_id AS "employeeId", 
          e.first_name || ' ' || e.last_name AS "employeeName",
          TO_CHAR(o.overtime_date, 'YYYY-MM-DD') AS "overtimeDate", 
          o.project_name AS "projectName", 
          o.start_time AS "startTime", 
          o.end_time AS "endTime", 
          o.total_hours AS "totalHours", 
          o.status AS "status", 
          o.approved_by AS "approvedBy",
          app.first_name || ' ' || app.last_name AS "approverName",
          o.notes AS "notes"
        FROM overtimes o
        JOIN employees e ON o.employee_id = e.employee_id
        LEFT JOIN employees app ON o.approved_by = app.employee_id
        WHERE 1=1
      `;
      
      const binds = {};
      
      if (filters.employeeId) {
        query += ` AND o.employee_id = :employeeId`;
        binds.employeeId = Number(filters.employeeId);
      }
      
      if (filters.month) {
        query += ` AND EXTRACT(MONTH FROM o.overtime_date) = :month`;
        binds.month = Number(filters.month);
      }
      
      if (filters.year) {
        query += ` AND EXTRACT(YEAR FROM o.overtime_date) = :year`;
        binds.year = Number(filters.year);
      }
      
      query += ` ORDER BY o.overtime_date DESC, o.overtime_id DESC`;
      
      const result = await conn.execute(query, binds);
      return result.rows;
    } finally {
      if (conn) await conn.close();
    }
  }

  async findById(id) {
    let conn;
    try {
      conn = await getConnection();
      const query = `
        SELECT 
          o.overtime_id AS "overtimeId", 
          o.employee_id AS "employeeId", 
          e.first_name || ' ' || e.last_name AS "employeeName",
          TO_CHAR(o.overtime_date, 'YYYY-MM-DD') AS "overtimeDate", 
          o.project_name AS "projectName", 
          o.start_time AS "startTime", 
          o.end_time AS "endTime", 
          o.total_hours AS "totalHours", 
          o.status AS "status", 
          o.approved_by AS "approvedBy",
          app.first_name || ' ' || app.last_name AS "approverName",
          o.notes AS "notes"
        FROM overtimes o
        JOIN employees e ON o.employee_id = e.employee_id
        LEFT JOIN employees app ON o.approved_by = app.employee_id
        WHERE o.overtime_id = :id
      `;
      const result = await conn.execute(query, [Number(id)]);
      return result.rows[0] || null;
    } finally {
      if (conn) await conn.close();
    }
  }

  async create(conn, data) {
    const query = `
      INSERT INTO overtimes (
        overtime_id,
        employee_id,
        overtime_date,
        project_name,
        start_time,
        end_time,
        total_hours,
        status
      ) VALUES (
        overtimes_seq.NEXTVAL,
        :employeeId,
        TO_DATE(:overtimeDate, 'YYYY-MM-DD'),
        :projectName,
        :startTime,
        :endTime,
        :totalHours,
        'Request'
      ) RETURNING overtime_id INTO :id
    `;
    
    const result = await conn.execute(query, {
      employeeId: Number(data.employeeId),
      overtimeDate: data.overtimeDate,
      projectName: data.projectName,
      startTime: data.startTime,
      endTime: data.endTime,
      totalHours: Number(data.totalHours),
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    });
    
    return result.outBinds.id[0];
  }

  async update(conn, id, data) {
    const query = `
      UPDATE overtimes
      SET 
        project_name = COALESCE(:projectName, project_name),
        start_time = COALESCE(:startTime, start_time),
        end_time = COALESCE(:endTime, end_time),
        total_hours = COALESCE(:totalHours, total_hours)
      WHERE overtime_id = :id
    `;
    
    const result = await conn.execute(query, {
      id: Number(id),
      projectName: data.projectName !== undefined ? data.projectName : null,
      startTime: data.startTime !== undefined ? data.startTime : null,
      endTime: data.endTime !== undefined ? data.endTime : null,
      totalHours: data.totalHours !== undefined ? Number(data.totalHours) : null
    });
    
    return result.rowsAffected > 0;
  }

  async updateStatus(conn, id, { approvedBy, status, notes }) {
    const query = `
      UPDATE overtimes
      SET 
        status = :status,
        approved_by = :approvedBy,
        notes = :notes
      WHERE overtime_id = :id
    `;
    const result = await conn.execute(query, {
      id: Number(id),
      status,
      approvedBy: Number(approvedBy),
      notes: notes || null
    });
    return result.rowsAffected > 0;
  }

  async delete(conn, id) {
    const query = `DELETE FROM overtimes WHERE overtime_id = :id`;
    const result = await conn.execute(query, { id: Number(id) });
    return result.rowsAffected > 0;
  }
}

module.exports = new OvertimeRepository();
