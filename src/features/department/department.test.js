jest.mock('../../infra/db');

const CreateDepartment = require('./CreateDepartment');
const { getConnection } = require('../../infra/db');
const { BadRequestError } = require('../../infra/AppError');

describe('CreateDepartment - Unit Test', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    let mockConn;

    beforeEach(() => {
        mockReq = {
            body: {}
        };
        mockRes = {
            success: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
        mockConn = {
            execute: jest.fn(),
            close: jest.fn()
        };
        getConnection.mockResolvedValue(mockConn);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('harus berhasil membuat department baru ketika input valid', async () => {
        mockReq.body.departmentName = 'HRD';

        // Mock execute output for RETURNING INTO bind
        mockConn.execute.mockResolvedValue({
            outBinds: {
                id: [1]
            }
        });

        await CreateDepartment(mockReq, mockRes, mockNext);

        expect(mockRes.success).toHaveBeenCalledWith(
            "Department created successfully",
            { departmentId: 1, departmentName: 'HRD' }
        );
        expect(mockConn.execute).toHaveBeenCalledTimes(1);
        expect(mockConn.close).toHaveBeenCalledTimes(1);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('harus melempar BadRequestError ketika nama department kosong', async () => {
        mockReq.body.departmentName = '';

        await CreateDepartment(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        expect(mockNext.mock.calls[0][0].message).toBe('Nama department wajib diisi');
        expect(mockConn.execute).not.toHaveBeenCalled();
    });

    it('harus melempar BadRequestError ketika nama department lebih dari 50 karakter', async () => {
        mockReq.body.departmentName = 'A'.repeat(51);

        await CreateDepartment(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        expect(mockNext.mock.calls[0][0].message).toBe('Department length name too long! Max 50 characters.');
        expect(mockConn.execute).not.toHaveBeenCalled();
    });
});
