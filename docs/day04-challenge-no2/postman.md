# Dokumentasi Pengujian API via Postman
## Modul Business Trip (Perjalanan Dinas) - Day 04 Challenge (No 2)

Dokumen ini berisi panduan lengkap pengujian REST API untuk modul Business Trip menggunakan Postman. Pengujian mencakup alur pembuatan, pembaharuan, persetujuan manager, pemrosesan finance, pengunggahan bukti pengeluaran, pencarian dengan filter, serta pembatalan pengajuan.

---

## 1. Persiapan Pengujian
Sebelum melakukan pengetesan, pastikan:
1. **Server Lokal Aktif**: Jalankan `npm run dev` di terminal. Base URL pengujian:
   `http://localhost:3000/api/v1/business-trips`
2. **Koneksi Database Aktif**: Koneksi ke database Oracle lokal (`hr` schema) terkonfigurasi dengan benar di `.env`.
3. **Data Karyawan Tersedia**: Memerlukan ID karyawan yang valid di database (contoh: ID `100` untuk Steven King, `101` untuk Neena Kochhar, `102` untuk Lex De Haan, `103` untuk Alexander Hunold).

---

## 2. Koleksi Pengujian Postman (Endpoints & Skenario)

### 1. POST - Mengajukan Perjalanan Dinas Baru (Add Trip)
Digunakan oleh karyawan/tim untuk membuat pengajuan perjalanan dinas baru. backend menghitung durasi hari dan tunjangan secara otomatis.

* **Method**: `POST`
* **URL**: `http://localhost:3000/api/v1/business-trips`
* **Headers**: `Content-Type: application/json`
* **Skenario A: Sukses Input Valid**
  * **Request Body (JSON)**:
    ```json
    {
      "destination": "JKT-YGY",
      "purpose": "Meet Client and Training",
      "startDate": "2025-07-01",
      "endDate": "2025-07-03",
      "employeeIds": [100, 101]
    }
    ```
  * **Expected Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Business Trip request submitted successfully",
      "data": {
        "businessTripId": 1,
        "destination": "JKT-YGY",
        "durationDays": 3,
        "totalAllowance": 2500000,
        "status": "New Request"
      }
    }
    ```
* **Skenario B: Gagal - Anggota Tim Tidak Terdaftar**
  * **Request Body (JSON)**:
    ```json
    {
      "destination": "JKT-YGY",
      "purpose": "Training",
      "startDate": "2025-07-01",
      "endDate": "2025-07-03",
      "employeeIds": [100, 9999]
    }
    ```
  * **Expected Response (404 Not Found)**:
    ```json
    {
      "success": false,
      "message": "Employee with ID 9999 not found in the team."
    }
    ```
* **Skenario C: Gagal - Validasi Zod (Tanggal Tidak Valid)**
  * **Request Body (JSON)**:
    ```json
    {
      "destination": "J",
      "purpose": "A",
      "startDate": "01-07-2025",
      "endDate": "2025/07/03",
      "employeeIds": []
    }
    ```
  * **Expected Response (400 Bad Request)**:
    ```json
    {
      "success": false,
      "message": "destination: Destination must be at least 2 characters long., purpose: Purpose must be at least 2 characters long., startDate: Start date must be in YYYY-MM-DD format., endDate: End date must be in YYYY-MM-DD format., employeeIds: At least one employee must be registered in the team."
    }
    ```

---

### 2. GET - Mengambil Semua Daftar Perjalanan Dinas (List View)
Menampilkan daftar seluruh perjalanan dinas dengan kolom `teams` berisi nama-nama karyawan anggota kelompok. Mendukung filter pencarian.

* **Method**: `GET`
* **URL**: `http://localhost:3000/api/v1/business-trips`
* **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Business Trips retrieved successfully",
    "data": [
      {
        "businessTripId": 1,
        "requestDate": "2026-06-09",
        "destination": "JKT-YGY",
        "purpose": "Meet Client and Training",
        "startDate": "2025-07-01",
        "endDate": "2025-07-03",
        "durationDays": 3,
        "totalAllowance": 2500000,
        "status": "New Request",
        "approvedBy": null,
        "approverName": " ",
        "teams": "Neena Kochhar, Steven King"
      }
    ]
  }
  ```

#### Filter Pencarian:
* **Filter by Karyawan**: `GET http://localhost:3000/api/v1/business-trips?employeeId=100`
* **Filter by Tanggal Pengajuan**: `GET http://localhost:3000/api/v1/business-trips?startDate=2026-06-01&endDate=2026-06-30`

---

### 3. GET - Mengambil Rincian Perjalanan Dinas (Details Modal)
Menampilkan data detail perjalanan dinas beserta breakdown tunjangan, daftar karyawan, dan bukti fisik (evidence).

* **Method**: `GET`
* **URL**: `http://localhost:3000/api/v1/business-trips/1` *(Ganti angka 1 dengan ID perjalanan dinas yang valid)*
* **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Business Trip retrieved successfully",
    "data": {
      "businessTripId": 1,
      "requestDate": "2026-06-09",
      "destination": "JKT-YGY",
      "purpose": "Meet Client and Training",
      "startDate": "2025-07-01",
      "endDate": "2025-07-03",
      "durationDays": 3,
      "transportAllowance": 1000000,
      "accommodationAllowance": 1050000,
      "dailyAllowance": 300000,
      "mealAllowance": 150000,
      "totalAllowance": 2500000,
      "status": "New Request",
      "approvedBy": null,
      "approverName": " ",
      "approvedDate": null,
      "processedBy": null,
      "processorName": " ",
      "processedDate": null,
      "transferredDate": null,
      "completedDate": null,
      "employees": [
        {
          "employeeId": 100,
          "employeeName": "Steven King"
        },
        {
          "employeeId": 101,
          "employeeName": "Neena Kochhar"
        }
      ],
      "evidences": []
    }
  }
  ```

---

### 4. PUT - Memodifikasi Pengajuan Perjalanan Dinas (Edit Trip)
Mengubah data pengajuan. Hanya dapat dilakukan apabila status pengajuan masih `New Request`.

* **Method**: `PUT`
* **URL**: `http://localhost:3000/api/v1/business-trips/1`
* **Headers**: `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "destination": "JKT-YGY Revised",
    "employeeIds": [100, 101, 102]
  }
  ```
* **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Business Trip request updated successfully",
    "data": {
      "businessTripId": 1,
      "destination": "JKT-YGY Revised",
      "employees": [
        { "employeeId": 100, "employeeName": "Steven King" },
        { "employeeId": 101, "employeeName": "Neena Kochhar" },
        { "employeeId": 102, "employeeName": "Lex De Haan" }
      ],
      "status": "New Request"
      // ... fields lainnya ter-update secara otomatis
    }
  }
  ```

---

### 5. PATCH - Persetujuan Manager (Approve Action)
Manager memberikan persetujuan (`Approved`) atau menolak (`Rejected`) pengajuan beserta memberikan catatan evaluasi (`Notes`).

* **Method**: `PATCH`
* **URL**: `http://localhost:3000/api/v1/business-trips/1/approve` *(Ganti angka 1 dengan ID yang valid)*
* **Headers**: `Content-Type: application/json`
* **Skenario A: Sukses Approve dengan Catatan**
  * **Request Body (JSON)**:
    ```json
    {
      "approvedBy": 102,
      "status": "Approved",
      "notes": "Disetujui untuk pengerjaan project software"
    }
    ```
  * **Expected Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Business Trip approval status updated successfully",
      "data": {
        "businessTripId": 1,
        "requestDate": "2026-06-09",
        "destination": "JKT-YGY Revised",
        "purpose": "Meet Client and Training",
        "startDate": "2025-07-01",
        "endDate": "2025-07-03",
        "durationDays": 3,
        "transportAllowance": 1000000,
        "accommodationAllowance": 1050000,
        "dailyAllowance": 300000,
        "mealAllowance": 150000,
        "totalAllowance": 2500000,
        "notes": "Disetujui untuk pengerjaan project software",
        "status": "Approved",
        "approvedBy": 102,
        "approverName": "Lex De Haan",
        "approvedDate": "2026-06-09"
      }
    }
    ```
* **Skenario B: Gagal - Validasi Zod (Notes Terlalu Panjang)**
  * **Request Body (JSON)**:
    ```json
    {
      "approvedBy": 102,
      "status": "Approved",
      "notes": "Ini adalah teks catatan yang sengaja dibuat sangat panjang melampaui batas maksimum dua ratus lima puluh lima karakter demi menguji keandalan skema validasi Zod yang dipasang pada modul bisnis trip. Teks ini harus melebihi batas panjang kolom yang diizinkan di database agar tertolak."
    }
    ```
  * **Expected Response (400 Bad Request)**:
    ```json
    {
      "success": false,
      "message": "notes: Notes must not exceed 255 characters."
    }
    ```

---

### 6. PATCH - Pemrosesan oleh Finance (Process Action)
Petugas Finance memproses pengajuan yang sudah disetujui manager.

* **Method**: `PATCH`
* **URL**: `http://localhost:3000/api/v1/business-trips/1/process`
* **Headers**: `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "processedBy": 103,
    "status": "Processed"
  }
  ```
* **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Business Trip processed successfully",
    "data": {
      "businessTripId": 1,
      "status": "Processed",
      "processedBy": 103,
      "processorName": "Alexander Hunold",
      "processedDate": "2026-06-09"
      // ...
    }
  }
  ```

---

### 7. POST - Unggah Bukti Pengeluaran (Upload Evidence)
Mengunggah file path bukti fisik transaksi. Dapat dilakukan setelah status minimal `Approved`.

* **Method**: `POST`
* **URL**: `http://localhost:3000/api/v1/business-trips/1/evidences`
* **Headers**: `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "filePath": "/uploads/ticket_receipt_001.png"
  }
  ```
* **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Evidence uploaded successfully",
    "data": {
      "businessTripId": 1,
      "evidences": [
        {
          "evidenceId": 1,
          "filePath": "/uploads/ticket_receipt_001.png",
          "uploadedDate": "2026-06-09"
        }
      ]
      // ...
    }
  }
  ```

---

### 8. DELETE - Menghapus Pengajuan Perjalanan Dinas (Cancel/Delete)
Menghapus data pengajuan perjalanan dinas. Hanya diizinkan jika status masih `New Request`.

* **Method**: `DELETE`
* **URL**: `http://localhost:3000/api/v1/business-trips/1`
* **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Business Trip request deleted successfully",
    "data": null
  }
  ```
* **Skenario Gagal: Menghapus Data yang Sudah Diproses (Terkunci)**
  * Jika dicoba ke ID yang sudah berstatus `Approved` atau `Processed`, response:
  ```json
  {
    "success": false,
    "message": "Only business trips with 'New Request' status can be deleted."
  }
  ```
