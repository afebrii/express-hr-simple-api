const { oracledb, getConnection } = require("../utils/db");

class BusinessTripRepository {
  async findAll(filters = {}) {
    let conn;
    try {
      conn = await getConnection();
      
      let query = `
        SELECT 
          bt.business_trip_id AS "businessTripId",
          TO_CHAR(bt.request_date, 'YYYY-MM-DD') AS "requestDate",
          bt.destination AS "destination",
          bt.purpose AS "purpose",
          TO_CHAR(bt.start_date, 'YYYY-MM-DD') AS "startDate",
          TO_CHAR(bt.end_date, 'YYYY-MM-DD') AS "endDate",
          bt.duration_days AS "durationDays",
          bt.total_allowance AS "totalAllowance",
          bt.status AS "status",
          bt.approved_by AS "approvedBy",
          app.first_name || ' ' || app.last_name AS "approverName",
          (
            SELECT LISTAGG(e.first_name || ' ' || e.last_name, ', ') WITHIN GROUP (ORDER BY e.first_name)
            FROM business_trip_employees bte
            JOIN employees e ON bte.employee_id = e.employee_id
            WHERE bte.business_trip_id = bt.business_trip_id
          ) AS "teams"
        FROM business_trips bt
        LEFT JOIN employees app ON bt.approved_by = app.employee_id
        WHERE 1=1
      `;
      
      const binds = {};
      
      if (filters.employeeId) {
        query += ` AND EXISTS (
          SELECT 1 
          FROM business_trip_employees bte2 
          WHERE bte2.business_trip_id = bt.business_trip_id 
            AND bte2.employee_id = :employeeId
        )`;
        binds.employeeId = Number(filters.employeeId);
      }
      
      if (filters.startDate && filters.endDate) {
        query += ` AND bt.request_date BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD')`;
        binds.startDate = filters.startDate;
        binds.endDate = filters.endDate;
      }
      
      query += ` ORDER BY bt.request_date DESC, bt.business_trip_id DESC`;
      
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
      const tripQuery = `
        SELECT 
          bt.business_trip_id AS "businessTripId",
          TO_CHAR(bt.request_date, 'YYYY-MM-DD') AS "requestDate",
          bt.destination AS "destination",
          bt.purpose AS "purpose",
          TO_CHAR(bt.start_date, 'YYYY-MM-DD') AS "startDate",
          TO_CHAR(bt.end_date, 'YYYY-MM-DD') AS "endDate",
          bt.duration_days AS "durationDays",
          -- Allowances
          bt.transport_allowance AS "transportAllowance",
          bt.accommodation_allowance AS "accommodationAllowance",
          bt.daily_allowance AS "dailyAllowance",
          bt.meal_allowance AS "mealAllowance",
          bt.total_allowance AS "totalAllowance",
          -- Workflow status
          bt.status AS "status",
          bt.approved_by AS "approvedBy",
          app.first_name || ' ' || app.last_name AS "approverName",
          TO_CHAR(bt.approved_date, 'YYYY-MM-DD') AS "approvedDate",
          bt.processed_by AS "processedBy",
          prc.first_name || ' ' || prc.last_name AS "processorName",
          TO_CHAR(bt.processed_date, 'YYYY-MM-DD') AS "processedDate",
          TO_CHAR(bt.transferred_date, 'YYYY-MM-DD') AS "transferredDate",
          TO_CHAR(bt.completed_date, 'YYYY-MM-DD') AS "completedDate"
        FROM business_trips bt
        LEFT JOIN employees app ON bt.approved_by = app.employee_id
        LEFT JOIN employees prc ON bt.processed_by = prc.employee_id
        WHERE bt.business_trip_id = :id
      `;
      const tripResult = await conn.execute(tripQuery, [Number(id)]);
      const trip = tripResult.rows[0];
      
      if (!trip) return null;

      // Fetch team members
      const membersQuery = `
        SELECT 
          bte.employee_id AS "employeeId",
          e.first_name || ' ' || e.last_name AS "employeeName"
        FROM business_trip_employees bte
        JOIN employees e ON bte.employee_id = e.employee_id
        WHERE bte.business_trip_id = :id
      `;
      const membersResult = await conn.execute(membersQuery, [Number(id)]);
      trip.employees = membersResult.rows;

      // Fetch evidences
      const evidencesQuery = `
        SELECT 
          evidence_id AS "evidenceId",
          file_path AS "filePath",
          TO_CHAR(uploaded_date, 'YYYY-MM-DD') AS "uploadedDate"
        FROM business_trip_evidences
        WHERE business_trip_id = :id
      `;
      const evidencesResult = await conn.execute(evidencesQuery, [Number(id)]);
      trip.evidences = evidencesResult.rows;

      return trip;
    } finally {
      if (conn) await conn.close();
    }
  }

  async create(conn, data) {
    const query = `
      INSERT INTO business_trips (
        business_trip_id,
        destination,
        purpose,
        start_date,
        end_date,
        duration_days,
        transport_allowance,
        accommodation_allowance,
        daily_allowance,
        meal_allowance,
        total_allowance,
        status
      ) VALUES (
        business_trips_seq.NEXTVAL,
        :destination,
        :purpose,
        TO_DATE(:startDate, 'YYYY-MM-DD'),
        TO_DATE(:endDate, 'YYYY-MM-DD'),
        :durationDays,
        :transportAllowance,
        :accommodationAllowance,
        :dailyAllowance,
        :mealAllowance,
        :totalAllowance,
        'New Request'
      ) RETURNING business_trip_id INTO :id
    `;
    
    const result = await conn.execute(query, {
      destination: data.destination,
      purpose: data.purpose,
      startDate: data.startDate,
      endDate: data.endDate,
      durationDays: Number(data.durationDays),
      transportAllowance: Number(data.transportAllowance),
      accommodationAllowance: Number(data.accommodationAllowance),
      dailyAllowance: Number(data.dailyAllowance),
      mealAllowance: Number(data.mealAllowance),
      totalAllowance: Number(data.totalAllowance),
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    });
    
    return result.outBinds.id[0];
  }

  async addMembers(conn, businessTripId, employeeIds) {
    const query = `
      INSERT INTO business_trip_employees (business_trip_id, employee_id)
      VALUES (:businessTripId, :employeeId)
    `;
    for (const employeeId of employeeIds) {
      await conn.execute(query, {
        businessTripId: Number(businessTripId),
        employeeId: Number(employeeId)
      });
    }
  }

  async clearMembers(conn, businessTripId) {
    const query = `DELETE FROM business_trip_employees WHERE business_trip_id = :businessTripId`;
    await conn.execute(query, { businessTripId: Number(businessTripId) });
  }

  async update(conn, id, data) {
    const query = `
      UPDATE business_trips
      SET 
        destination = COALESCE(:destination, destination),
        purpose = COALESCE(:purpose, purpose),
        start_date = COALESCE(TO_DATE(:startDate, 'YYYY-MM-DD'), start_date),
        end_date = COALESCE(TO_DATE(:endDate, 'YYYY-MM-DD'), end_date),
        duration_days = COALESCE(:durationDays, duration_days),
        transport_allowance = COALESCE(:transportAllowance, transport_allowance),
        accommodation_allowance = COALESCE(:accommodationAllowance, accommodation_allowance),
        daily_allowance = COALESCE(:dailyAllowance, daily_allowance),
        meal_allowance = COALESCE(:mealAllowance, meal_allowance),
        total_allowance = COALESCE(:totalAllowance, total_allowance)
      WHERE business_trip_id = :id
    `;
    
    const result = await conn.execute(query, {
      id: Number(id),
      destination: data.destination || null,
      purpose: data.purpose || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      durationDays: data.durationDays ? Number(data.durationDays) : null,
      transportAllowance: data.transportAllowance ? Number(data.transportAllowance) : null,
      accommodationAllowance: data.accommodationAllowance ? Number(data.accommodationAllowance) : null,
      dailyAllowance: data.dailyAllowance ? Number(data.dailyAllowance) : null,
      mealAllowance: data.mealAllowance ? Number(data.mealAllowance) : null,
      totalAllowance: data.totalAllowance ? Number(data.totalAllowance) : null
    });
    
    return result.rowsAffected > 0;
  }

  async updateStatus(conn, id, updateData) {
    // Dynamically build the update statement based on fields provided
    let query = `UPDATE business_trips SET status = :status`;
    const binds = { id: Number(id), status: updateData.status };

    if (updateData.approvedBy) {
      query += `, approved_by = :approvedBy, approved_date = SYSDATE`;
      binds.approvedBy = Number(updateData.approvedBy);
    }
    if (updateData.processedBy) {
      query += `, processed_by = :processedBy, processed_date = SYSDATE`;
      binds.processedBy = Number(updateData.processedBy);
    }
    if (updateData.transferredDate) {
      query += `, transferred_date = TO_DATE(:transferredDate, 'YYYY-MM-DD')`;
      binds.transferredDate = updateData.transferredDate;
    }
    if (updateData.completedDate) {
      query += `, completed_date = TO_DATE(:completedDate, 'YYYY-MM-DD')`;
      binds.completedDate = updateData.completedDate;
    }

    query += ` WHERE business_trip_id = :id`;
    const result = await conn.execute(query, binds);
    return result.rowsAffected > 0;
  }

  async addEvidence(conn, businessTripId, filePath) {
    const query = `
      INSERT INTO business_trip_evidences (
        evidence_id,
        business_trip_id,
        file_path
      ) VALUES (
        bt_evidences_seq.NEXTVAL,
        :businessTripId,
        :filePath
      )
    `;
    await conn.execute(query, {
      businessTripId: Number(businessTripId),
      filePath
    });
  }

  async delete(conn, id) {
    const query = `DELETE FROM business_trips WHERE business_trip_id = :id`;
    const result = await conn.execute(query, { id: Number(id) });
    return result.rowsAffected > 0;
  }
}

module.exports = new BusinessTripRepository();
