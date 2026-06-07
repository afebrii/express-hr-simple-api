require('dotenv').config();

const dbConfig = {
    host:          process.env.DB_HOST       || 'localhost',
    port:          parseInt(process.env.DB_PORT) || 1521,
    service:       process.env.DB_SERVICE    || 'XE',
    user:          process.env.DB_USER       || 'hr',
    password:      process.env.DB_PASSWORD   || 'hr',
    pool: {
        min:         parseInt(process.env.DB_POOL_MIN)       || 2,
        max:         parseInt(process.env.DB_POOL_MAX)       || 10,
        increment:   parseInt(process.env.DB_POOL_INCREMENT) || 1,
    },
};

module.exports = dbConfig;