const overtimeRepository = require("../repositories/overtimeRepository");
const employeeRepository = require("../repositories/employeeRepository");
const { BadRequestError, NotFoundError } = require("../utils/customError");
const { getConnection } = require("../utils/db");

class OvertimeService {
  async getAllOvertimes(filters) {
    return await overtimeRepository.findAll(filters);
  }

  async getOvertimeById(id) {
    const overtime = await overtimeRepository.findById(id);
    if (!overtime) {
      throw new NotFoundError(`Overtime request with ID ${id} not found.`);
    }
    return overtime;
  }

  async requestOvertime(data) {
    // 1. Validate employee exists
    const employee = await employeeRepository.findById(data.employeeId);
    if (!employee) {
      throw new NotFoundError(`Employee with ID ${data.employeeId} not found.`);
    }

    let conn;
    try {
      conn = await getConnection();
      const overtimeId = await overtimeRepository.create(conn, data);
      await conn.commit();
      
      return {
        overtimeId,
        employeeId: data.employeeId,
        projectName: data.projectName,
        status: 'Request'
      };
    } catch (error) {
      if (conn) {
        await conn.rollback();
      }
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }

  async updateOvertime(id, data) {
    // 1. Validate overtime exists
    const overtime = await overtimeRepository.findById(id);
    if (!overtime) {
      throw new NotFoundError(`Overtime request with ID ${id} not found.`);
    }

    // 2. Validate status is 'Request'
    if (overtime.status !== 'Request') {
      throw new BadRequestError(`Only overtime requests with 'Request' status can be modified.`);
    }

    let conn;
    try {
      conn = await getConnection();
      const success = await overtimeRepository.update(conn, id, data);
      if (!success) {
        throw new NotFoundError(`Overtime request with ID ${id} not found.`);
      }
      await conn.commit();
      
      return await overtimeRepository.findById(id);
    } catch (error) {
      if (conn) {
        await conn.rollback();
      }
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }

  async approveOvertime(id, { approvedBy, status, notes }) {
    // 1. Validate status values
    if (!['Approved', 'Rejected'].includes(status)) {
      throw new BadRequestError(`Status must be either 'Approved' or 'Rejected'.`);
    }

    // 2. Validate overtime exists
    const overtime = await overtimeRepository.findById(id);
    if (!overtime) {
      throw new NotFoundError(`Overtime request with ID ${id} not found.`);
    }

    // 3. Validate approver exists
    const approver = await employeeRepository.findById(approvedBy);
    if (!approver) {
      throw new NotFoundError(`Approver employee with ID ${approvedBy} not found.`);
    }

    let conn;
    try {
      conn = await getConnection();
      const success = await overtimeRepository.updateStatus(conn, id, { approvedBy, status, notes });
      if (!success) {
        throw new NotFoundError(`Overtime request with ID ${id} not found.`);
      }
      await conn.commit();
      
      return await overtimeRepository.findById(id);
    } catch (error) {
      if (conn) {
        await conn.rollback();
      }
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }

  async deleteOvertime(id) {
    // 1. Validate overtime exists
    const overtime = await overtimeRepository.findById(id);
    if (!overtime) {
      throw new NotFoundError(`Overtime request with ID ${id} not found.`);
    }

    // 2. Validate status is 'Request'
    if (overtime.status !== 'Request') {
      throw new BadRequestError(`Only overtime requests with 'Request' status can be deleted.`);
    }

    let conn;
    try {
      conn = await getConnection();
      const success = await overtimeRepository.delete(conn, id);
      if (!success) {
        throw new NotFoundError(`Overtime request with ID ${id} not found.`);
      }
      await conn.commit();
      return true;
    } catch (error) {
      if (conn) {
        await conn.rollback();
      }
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }
}

module.exports = new OvertimeService();
