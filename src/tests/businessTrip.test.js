jest.mock('../repositories/businessTripRepository');
jest.mock('../repositories/employeeRepository');

const businessTripService = require('../services/businessTripService');
const businessTripRepository = require('../repositories/businessTripRepository');
const employeeRepository = require('../repositories/employeeRepository');
const { BadRequestError, NotFoundError } = require('../utils/customError');

describe('BusinessTripService - Unit Test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestTrip', () => {
    it('should successfully create a trip and calculate correct allowances when input is valid', async () => {
      // Mock employee existence checks
      employeeRepository.findById.mockResolvedValue({ employeeId: 100, firstName: 'Steven' });
      businessTripRepository.create.mockResolvedValue(10);
      businessTripRepository.addMembers.mockResolvedValue(true);

      const payload = {
        destination: 'JKT-BDG',
        purpose: 'Training',
        startDate: '2025-06-01',
        endDate: '2025-06-02', // 2 days
        employeeIds: [100]
      };

      const result = await businessTripService.requestTrip(payload);

      // Duration: 2 days
      // Transport: 500,000 * 2 = 1,000,000
      // Accommodation: 350,000 * 2 = 700,000
      // Daily: 100,000 * 2 = 200,000
      // Meal: 50,000 * 2 = 100,000
      // Total: 2,000,000
      expect(result).toEqual({
        businessTripId: 10,
        destination: 'JKT-BDG',
        durationDays: 2,
        totalAllowance: 2000000,
        status: 'New Request'
      });

      expect(employeeRepository.findById).toHaveBeenCalledWith(100);
      expect(businessTripRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError if one of the team employees does not exist', async () => {
      employeeRepository.findById.mockResolvedValueOnce({ employeeId: 100 });
      employeeRepository.findById.mockResolvedValueOnce(null); // second employee fails

      const payload = {
        destination: 'JKT-BDG',
        purpose: 'Training',
        startDate: '2025-06-01',
        endDate: '2025-06-02',
        employeeIds: [100, 999]
      };

      await expect(businessTripService.requestTrip(payload))
        .rejects
        .toThrow(NotFoundError);

      expect(businessTripRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTrip', () => {
    it('should throw BadRequestError if the existing trip is not in New Request status', async () => {
      businessTripRepository.findById.mockResolvedValue({
        businessTripId: 10,
        status: 'Approved',
        startDate: '2025-06-01',
        endDate: '2025-06-02'
      });

      await expect(businessTripService.updateTrip(10, { destination: 'JKT-YGY' }))
        .rejects
        .toThrow(BadRequestError);

      expect(businessTripRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('approveTrip', () => {
    it('should throw NotFoundError if the trip does not exist', async () => {
      businessTripRepository.findById.mockResolvedValue(null);

      await expect(businessTripService.approveTrip(999, { approvedBy: 101, status: 'Approved', notes: 'Go ahead' }))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw BadRequestError if status is invalid', async () => {
      await expect(businessTripService.approveTrip(10, { approvedBy: 101, status: 'InvalidStatus' }))
        .rejects
        .toThrow(BadRequestError);
    });

    it('should successfully approve the trip when status and notes are valid', async () => {
      businessTripRepository.findById.mockResolvedValue({
        businessTripId: 10,
        status: 'New Request',
        startDate: '2025-06-01',
        endDate: '2025-06-02'
      });
      employeeRepository.findById.mockResolvedValue({ employeeId: 101, firstName: 'Neena' });
      businessTripRepository.updateStatus.mockResolvedValue(true);

      const result = await businessTripService.approveTrip(10, { approvedBy: 101, status: 'Approved', notes: 'Approved ok' });
      expect(businessTripRepository.updateStatus).toHaveBeenCalledWith(expect.anything(), 10, {
        status: 'Approved',
        approvedBy: 101,
        notes: 'Approved ok'
      });
    });
  });
});
