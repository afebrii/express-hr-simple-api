const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

//1. call config
const appConfig = require("./config/appConfig");
const dbConfig = require("./config/dbConfig");
const { getConnection } = require("./utils/db");

//call middleware
const { globalErrorHandler } = require("./middlewares/errorHandler");
const { globalResponseHandler } = require("./utils/response");

const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");

//3. call controllers, jika ada controller lain misal regionController, simpan disini
const departmentController = require("./controllers/departmentController");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//2. call router
app.use(globalResponseHandler);

app.use("/", indexRouter);
app.use("/users", usersRouter);

// --- Test Health check -------------------------
app.get("/health", (req, res) => {
  res.json({
    success: true,
    statusCode: 200,
    message: "Server is running",
    env: appConfig.env,
    timestamp: new Date().toISOString(),
  });
});

//4.call route endpoint
app.get(`${appConfig.api.prefix}/departments`, departmentController.findAll);
app.get(
  `${appConfig.api.prefix}/departments/:id`,
  departmentController.findById,
);
app.post(`${appConfig.api.prefix}/departments`, departmentController.create);
app.put(`${appConfig.api.prefix}/departments/:id`, departmentController.update);
app.delete(`${appConfig.api.prefix}/departments/:id`, departmentController.remove);


app.use(globalErrorHandler);

// ----------- Database Connection & Start Server ----------------
const startServer = async () => {
  try {
    // Test koneksi ke Oracle DB sebelum running server Express
    console.log("Connecting to Oracle Database...");

    const testConn = await getConnection();
    await testConn.close(); // Langsung tutup jika koneksi sukses
    console.log("Connection to OracleDB Succeed");

    // open port jika database udah aman terkoneksi
    app.listen(appConfig.port, () => {
      console.log(
        `Server running on http://localhost:${appConfig.port} [Mode: ${appConfig.env}]`,
      );
    });
  } catch (error) {
    console.error("Error when trying connect to db:", error.message);
    process.exit(1); // Shutdown aplikasi jika db gagal konek
  }
};

// init server
startServer();

module.exports = app;
