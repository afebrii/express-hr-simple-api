// 1. Lakukan Mocking pada Repository agar tidak menembak OracleDB
jest.mock('../repositories/departmentRepository');

const departmentService = require('../services/departmentService');
const departmentRepository = require('../repositories/departmentRepository');
const { BadRequestError,NotFoundError } = require('../utils/customError');

describe('DepartmentService - Unit Test', () => {
    
    // Bersihkan dulu semua sisa mock setelah setiap test selesai dijalankan
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createDepartment', () => {
        
        // --- TEST 1: SKENARIO SUKSES ---
        it('harus berhasil membuat department baru ketika input valid', async () => {
            // Pasang fake data yg akan diekpetasikan saat testing
            const mockRepositoryResponse = { departmentId: 1, departmentName: 'HRD' };
            
            // Perintahkan mock repository untuk mengembalikan data tiruan di atas
            departmentRepository.create.mockResolvedValue(mockRepositoryResponse);

            // Eksekusi fungsi service yang asli
            const result = await departmentService.createDepartment('HRD');

            // Ekspektasi hasil (Assertion)
            expect(result).toBeDefined();
            expect(result.departmentName).toBe('HRD');
            expect(result.departmentId).toBe(1);
            
            // Pastikan fungsi di repository benar-benar dipanggil 1 kali
            expect(departmentRepository.create).toHaveBeenCalledTimes(1);
            expect(departmentRepository.create).toHaveBeenCalledWith('HRD');
        });

        // --- TEST 2: SKENARIO GAGAL (VALIDASI KOSONG) ---
        it('harus melempar BadRequestError ketika nama department kosong', async () => {
            // Eksekusi service dengan argumen kosong dan cek apakah melempar error yang sesuai
            await expect(departmentService.createDepartment(''))
                .rejects
                .toThrow(BadRequestError);
                
            await expect(departmentService.createDepartment(''))
                .rejects
                .toThrow('Nama department wajib diisi');

            // Pastikan repository tidak boleh dipanggil sama sekali jika validasi gagal
            expect(departmentRepository.create).not.toHaveBeenCalled();
        });

        // --- TEST 3: SKENARIO GAGAL (NAMA TERLALU PANJANG) ---
        it('harus melempar BadRequestError ketika nama department lebih dari 50 karakter', async () => {
            const longName = 'A'.repeat(51); // Membuat teks 'AAAA...' sepanjang 51 karakter

            await expect(departmentService.createDepartment(longName))
                .rejects
                .toThrow(BadRequestError);

            expect(departmentRepository.create).not.toHaveBeenCalled();
        });
    });
});