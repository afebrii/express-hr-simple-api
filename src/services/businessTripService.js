const businessTripRepository = require("../repositories/businessTripRepository");
const employeeRepository = require("../repositories/employeeRepository");
const { BadRequestError, NotFoundError } = require("../utils/customError");
const { getConnection } = require("../utils/db");

class BusinessTripService {
  // Allowance Rate Constants
  ALLOWANCES = {
    TRANSPORT_RATE: 500000, // Transport per way (typically round trip is x2 = 1,000,000)
    ACCOMMODATION_RATE: 350000, // Accommodation rate per day
    DAILY_RATE: 100000, // Daily allowance per day
    MEAL_RATE: 50000 // Meal allowance per day
  };

  calculateDurationDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || start > end) {
      throw new BadRequestError("Invalid start or end date.");
    }
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of start day
  }

  calculateAllowances(durationDays) {
    const transportAllowance = this.ALLOWANCES.TRANSPORT_RATE * 2;
    const accommodationAllowance = this.ALLOWANCES.ACCOMMODATION_RATE * durationDays;
    const dailyAllowance = this.ALLOWANCES.DAILY_RATE * durationDays;
    const mealAllowance = this.ALLOWANCES.MEAL_RATE * durationDays;
    const totalAllowance = transportAllowance + accommodationAllowance + dailyAllowance + mealAllowance;

    return {
      transportAllowance,
      accommodationAllowance,
      dailyAllowance,
      mealAllowance,
      totalAllowance
    };
  }

  async getAllTrips(filters) {
    return await businessTripRepository.findAll(filters);
  }

  async getTripById(id) {
    const trip = await businessTripRepository.findById(id);
    if (!trip) {
      throw new NotFoundError(`Business Trip with ID ${id} not found.`);
    }
    return trip;
  }

  async requestTrip(data) {
    // 1. Verify all team employee IDs exist
    for (const empId of data.employeeIds) {
      const empExists = await employeeRepository.findById(empId);
      if (!empExists) {
        throw new NotFoundError(`Employee with ID ${empId} not found in the team.`);
      }
    }

    // 2. Perform calculations
    const durationDays = this.calculateDurationDays(data.startDate, data.endDate);
    const allowances = this.calculateAllowances(durationDays);

    const tripData = {
      destination: data.destination,
      purpose: data.purpose,
      startDate: data.startDate,
      endDate: data.endDate,
      durationDays,
      ...allowances
    };

    let conn;
    try {
      conn = await getConnection();
      
      // 3. Save trip details
      const businessTripId = await businessTripRepository.create(conn, tripData);
      
      // 4. Associate employees
      await businessTripRepository.addMembers(conn, businessTripId, data.employeeIds);
      
      await conn.commit();
      
      return {
        businessTripId,
        destination: data.destination,
        durationDays,
        totalAllowance: allowances.totalAllowance,
        status: 'New Request'
      };
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }

  async updateTrip(id, data) {
    // 1. Verify trip exists
    const trip = await businessTripRepository.findById(id);
    if (!trip) {
      throw new NotFoundError(`Business Trip with ID ${id} not found.`);
    }

    // 2. Verify status is 'New Request'
    if (trip.status !== 'New Request') {
      throw new BadRequestError(`Only business trips with 'New Request' status can be modified.`);
    }

    // 3. Verify employees if provided
    if (data.employeeIds) {
      for (const empId of data.employeeIds) {
        const empExists = await employeeRepository.findById(empId);
        if (!empExists) {
          throw new NotFoundError(`Employee with ID ${empId} not found in the team.`);
        }
      }
    }

    const startDate = data.startDate || trip.startDate;
    const endDate = data.endDate || trip.endDate;
    const durationDays = this.calculateDurationDays(startDate, endDate);
    const allowances = this.calculateAllowances(durationDays);

    const tripData = {
      destination: data.destination || null,
      purpose: data.purpose || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      durationDays,
      ...allowances
    };

    let conn;
    try {
      conn = await getConnection();
      
      // Update basic details
      const success = await businessTripRepository.update(conn, id, tripData);
      if (!success) {
        throw new NotFoundError(`Business Trip with ID ${id} not found.`);
      }

      // Re-associate team members if provided
      if (data.employeeIds) {
        await businessTripRepository.clearMembers(conn, id);
        await businessTripRepository.addMembers(conn, id, data.employeeIds);
      }

      await conn.commit();
      return await businessTripRepository.findById(id);
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }

  async approveTrip(id, { approvedBy, status, notes }) {
    if (!['Approved', 'Rejected'].includes(status)) {
      throw new BadRequestError(`Status must be either 'Approved' or 'Rejected'.`);
    }

    const trip = await businessTripRepository.findById(id);
    if (!trip) {
      throw new NotFoundError(`Business Trip with ID ${id} not found.`);
    }

    if (trip.status !== 'New Request') {
      throw new BadRequestError(`Only trips in 'New Request' status can be approved or rejected.`);
    }

    const approver = await employeeRepository.findById(approvedBy);
    if (!approver) {
      throw new NotFoundError(`Approver employee with ID ${approvedBy} not found.`);
    }

    let conn;
    try {
      conn = await getConnection();
      const success = await businessTripRepository.updateStatus(conn, id, {
        status,
        approvedBy,
        notes
      });
      if (!success) {
        throw new NotFoundError(`Business Trip with ID ${id} not found.`);
      }
      await conn.commit();
      return await businessTripRepository.findById(id);
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }

  async processTrip(id, processedBy) {
    const trip = await businessTripRepository.findById(id);
    if (!trip) {
      throw new NotFoundError(`Business Trip with ID ${id} not found.`);
    }

    if (trip.status !== 'Approved') {
      throw new BadRequestError(`Only approved trips can be processed by finance.`);
    }

    const processor = await employeeRepository.findById(processedBy);
    if (!processor) {
      throw new NotFoundError(`Finance officer with ID ${processedBy} not found.`);
    }

    let conn;
    try {
      conn = await getConnection();
      const success = await businessTripRepository.updateStatus(conn, id, {
        status: 'Processed',
        processedBy
      });
      if (!success) {
        throw new NotFoundError(`Business Trip with ID ${id} not found.`);
      }
      await conn.commit();
      return await businessTripRepository.findById(id);
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }

  async uploadEvidence(id, filePath) {
    const trip = await businessTripRepository.findById(id);
    if (!trip) {
      throw new NotFoundError(`Business Trip with ID ${id} not found.`);
    }

    if (!['Approved', 'Processed', 'Completed'].includes(trip.status)) {
      throw new BadRequestError("Evidences can only be uploaded for Approved, Processed, or Completed trips.");
    }

    let conn;
    try {
      conn = await getConnection();
      await businessTripRepository.addEvidence(conn, id, filePath);
      await conn.commit();
      return await businessTripRepository.findById(id);
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }

  async deleteTrip(id) {
    const trip = await businessTripRepository.findById(id);
    if (!trip) {
      throw new NotFoundError(`Business Trip with ID ${id} not found.`);
    }

    if (trip.status !== 'New Request') {
      throw new BadRequestError(`Only business trips with 'New Request' status can be deleted.`);
    }

    let conn;
    try {
      conn = await getConnection();
      const success = await businessTripRepository.delete(conn, id);
      if (!success) {
        throw new NotFoundError(`Business Trip with ID ${id} not found.`);
      }
      await conn.commit();
      return true;
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }
}

module.exports = new BusinessTripService();
