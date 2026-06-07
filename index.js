const app = require("./src/app");
const appConfig = require("./config/appConfig");
const { getConnection, closeConnectionPool } = require("./src/utils/db");

let server;

const startServer = async () => {
    try {
        console.log('Connecting to Oracle Database...');
        const testConn = await getConnection();
        await testConn.close();
        console.log('Connection to OracleDB Succeed');

        const PORT = appConfig.port || 3000;
        server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error db:', error.message);
        process.exit(1);
    }
};


const gracefulShutdown = (signal) => {
    console.log(`\n Received ${signal}. Starting graceful shutdown...`);

    // Jika server Express lagi running, stop menerima request baru
    if (server) {
        server.close(async () => {
            console.log('Express server closed. No longer accepting new requests.');
            await shutdownDependencies();
        });
    } else {
        // Jika server belum sempat running tapi database sudah terkoneksi
        shutdownDependencies();
    }
};

// helpers untuk close connection to database
const shutdownDependencies = async () => {
    try {
        console.log('Closing Oracle database connection pool...');

        // Panggil function close connectionpool 
        if (typeof closeConnectionPool === 'function') {
            await closeConnectionPool();
            console.log('Oracle database pool closed successfully.');
        } else {
            console.log('closeConnectionPool function not found in db.js');
        }

        console.log('Graceful shutdown complete. Exiting process.');
        process.exit(0);
    } catch (error) {
        console.error('Error during database pool closure:', error.message);
        process.exit(1);
    }
};

// Jaga-jaga jika proses clean ada yg ngegantung (Force close setelah 10 detik)
const setupTimeout = () => {
    setTimeout(() => {
        console.error('Forcefully shutting down due to timeout');
        process.exit(1);
    }, 10000);
};

// listening sinyal interupsi dari OS
process.on('SIGINT', () => {
    setupTimeout();
    gracefulShutdown('SIGINT');
});

process.on('SIGTERM', () => {
    setupTimeout();
    gracefulShutdown('SIGTERM');
});

// Running server
startServer();

// // ----------- Database Connection & Start Server ----------------
// const startServer = async () => {
//     try {
//         // Test koneksi ke Oracle DB sebelum running server Express
//         console.log("Connecting to Oracle Database...");

//         const testConn = await getConnection();
//         await testConn.close(); // Langsung tutup jika koneksi sukses
//         console.log("Connection to OracleDB Succeed");

//         // open port jika database udah aman terkoneksi
//         app.listen(appConfig.port, () => {
//             console.log(
//                 `Server running on http://localhost:${appConfig.port} [Mode: ${appConfig.env}]`,
//             );
//         });
//     } catch (error) {
//         console.error("Error when trying connect to db:", error.message);
//         process.exit(1); // Shutdown aplikasi jika db gagal konek
//     }
// };

// // init server
// startServer();