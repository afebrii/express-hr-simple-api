const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

//1. call config
const appConfig = require("./infra/config/appConfig");
const dbConfig = require("./infra/config/dbConfig");
const { getConnection } = require("./infra/db");

//call middleware
const { globalErrorHandler } = require("./infra/errorHandler");
const { globalResponseHandler } = require("./infra/response");

// call router
const indexRouter = require("./features/index");

const app = express();

const corsOptions = {
  // Masukkan daftar domain/URL frontend yang boleh mengakses API ini
  origin: [
    'http://localhost:5000',      // Aplikasi flutter/react/vue
    'http://127.0.0.1:5500',      // Live Server VS Code
    'https://hr-code.com'  // Domain production
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Method HTTP yang diizinkan
  allowedHeaders: ['Content-Type', 'Authorization'], // Header yang diizinkan
  optionsSuccessStatus: 200 // Untuk kompatibilitas browser lama
};

// app.use(cors());
app.use(cors(corsOptions)); // Aktifkan cors dengan konfigurasi

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//2. call router
app.use(globalResponseHandler);

//4.call global route
app.use(`${appConfig.api.prefix}`, indexRouter);

app.use(globalErrorHandler);

module.exports = app;
