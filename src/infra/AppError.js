//1. BASE CUSTOM ERROR
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message); // Panggil constructor dari class Error bawaan JS
        this.statusCode = statusCode; // Sisispkan HTTP Status Code

        // Memastikan stack trace (jejak baris error) tetap akurat di Node.js
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 2. BAD REQUEST ERROR (HTTP 400)
 * Digunakan saat client mengirimkan data yang salah, kurang, atau validasi gagal.
 */
class BadRequestError extends CustomError {
    constructor(message = 'Bad request. Invalid input or missing required data.') {
        super(message, 400); // 400 adalah statusCode untuk Bad Request
        this.name = 'BadRequestError'; // Mengubah nama error dari 'Error' menjadi 'BadRequestError'
    }
}

/**
 * 3. NOT FOUND ERROR (HTTP 404)
 * Digunakan saat data yang dicari di database Oracle tidak ditemukan.
 */
class NotFoundError extends CustomError {
    constructor(message = 'The requested resource was not found.') {
        super(message, 404); // 404 adalah statusCode untuk Not Found
        this.name = 'NotFoundError';
    }
}

/**
 * 4. UNAUTHORIZED ERROR (HTTP 401) - Opsional 
 * Digunakan jika user belum login atau token JWT salah/expired.
 */
class UnauthorizedError extends CustomError {
    constructor(message = 'Authentication required. Please log in.') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

/**
 * 5. FORBIDDEN ERROR (HTTP 403)
 * Digunakan ketika credential user nya valid, tapi ga punya permission tuk access resource.
 */
class ForbiddenError extends CustomError {
    constructor(message = 'Access denied. You do not have permission to perform this action.') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

/**
 * 6. CONFLICT ERROR (HTTP 409)
 * Digunakan ketika ada konflik resource, misalnya data duplikat/sudah ada.
 */
class ConflictError extends CustomError {
    constructor(message = 'Conflict. The resource already exists.') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

// Eksport semua kelas agar bisa di-require di file Service atau Controller mana pun
module.exports = {
    CustomError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError
};
