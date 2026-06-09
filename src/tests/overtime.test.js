jest.mock('../repositories/overtimeRepository');
jest.mock('../repositories/employeeRepository');

const overtimeService = require('../services/overtimeService');
const overtimeRepository = require('../repositories/overtimeRepository');
const employeeRepository = require('../repositories/employeeRepository');
const { BadRequestError, NotFoundError } = require('../utils/customError');

describe('OvertimeService - Unit Test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestOvertime', () => {
    it('should successfully request overtime when employee exists and database insert succeeds', async () => {
      employeeRepository.findById.mockResolvedValue({ employeeId: 100, firstName: 'Steven' });
      overtimeRepository.create.mockResolvedValue(123);

      const payload = {
        employeeId: 100,
        overtimeDate: '2025-06-09',
        projectName: 'WebDev I',
        startTime: '07:00',
        endTime: '09:00',
        totalHours: 2.0
      };

      const result = await overtimeService.requestOvertime(payload);

      expect(result).toEqual({
        overtimeId: 123,
        employeeId: 100,
        projectName: 'WebDev I',
        status: 'Request'
      });
      expect(employeeRepository.findById).toHaveBeenCalledWith(100);
      expect(overtimeRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError if employee does not exist', async () => {
      employeeRepository.findById.mockResolvedValue(null);

      const payload = {
        employeeId: 999,
        overtimeDate: '2025-06-09',
        projectName: 'WebDev I',
        startTime: '07:00',
        endTime: '09:00',
        totalHours: 2.0
      };

      await expect(overtimeService.requestOvertime(payload))
        .rejects
        .toThrow(NotFoundError);

      expect(overtimeRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateOvertime', () => {
    it('should throw BadRequestError if the existing overtime request is not in Request status', async () => {
      overtimeRepository.findById.mockResolvedValue({
        overtimeId: 1,
        status: 'Approved'
      });

      await expect(overtimeService.updateOvertime(1, { projectName: 'New Project Name' }))
        .rejects
        .toThrow(BadRequestError);

      expect(overtimeRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('approveOvertime', () => {
    it('should throw BadRequestError if validation status is invalid', async () => {
      await expect(overtimeService.approveOvertime(1, { approvedBy: 101, status: 'InvalidStatus' }))
        .rejects
        .toThrow(BadRequestError);
    });

    it('should throw NotFoundError if approver employee does not exist', async () => {
      overtimeRepository.findById.mockResolvedValue({
        overtimeId: 1,
        status: 'Request'
      });
      employeeRepository.findById.mockResolvedValue(null);

      await expect(overtimeService.approveOvertime(1, { approvedBy: 999, status: 'Approved' }))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
