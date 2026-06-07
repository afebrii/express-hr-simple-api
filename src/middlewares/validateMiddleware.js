const { BadRequestError } = require('../utils/customError');

/**
 * Middleware generator untuk memvalidasi request body menggunakan Zod
 * validateBody (using arrow function)
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            if (result.error && result.error.issues && result.error.issues.length > 0) {

                // Mengambil pesan custom (misal: "Department name is too long")
                const customErrorMessage = result.error.issues[0].message;

                // Ambil juga nama field-nya untuk tambahan info (opsional, misal: "departmentName")
                const fieldName = result.error.issues[0].path.join('.');

                // Hasilnya akan informatif: "departmentName: Department name is too long."
                throw new BadRequestError(`${fieldName}: ${customErrorMessage}`);
            }

            // Jika bukan error diatas, baru gunakan fallback ini
            throw new BadRequestError('Validation failed.');
        }

        // Jika sukses, timpa req.body dengan data bersih hasil parsing Zod
        req.body = result.data;
        next();
    };
};

module.exports = { validateBody };