# Dokumentasi Pengujian API via Postman
## Modul Overtime (Lembur) - Day 04 Challenge

Dokumen ini berisi panduan lengkap untuk melakukan pengujian REST API pada modul Overtime menggunakan Postman. Panduan ini mencakup skenario pengujian untuk 3 halaman mockup yang telah diimplementasikan (Daftar Lembur Karyawan, Form Add/Edit Lembur, dan Halaman Manager Approval).

---

## 1. Persiapan Pengujian
Sebelum melakukan pengetesan, pastikan:
1. **Server Lokal Berjalan**: Jalankan `npm run dev` pada terminal proyek. Base URL pengujian adalah:
   `http://localhost:3000/api/v1/overtimes`
2. **Koneksi Database Aktif**: Koneksi ke skema Oracle `hr` lokal telah dikonfigurasi dengan benar di file `.env`.
3. **Data Dummy Siap**: Database telah di-seed dengan 10 data dummy (menggunakan script `seed_overtimes.js`).

---

## 2. Koleksi Pengujian Postman (Endpoints & Skenario)

### FITUR 1: PENGAJUAN LEMBUR (FORM ADD)
Digunakan oleh Karyawan untuk mencatat jam lembur baru.

#### 1. POST - Mengajukan Lembur Baru (Aksi Add $\rightarrow$ Save)
* **Method**: `POST`
* **URL**: `http://localhost:3000/api/v1/overtimes`
* **Headers**: `Content-Type: application/json`
* **Skenario A: Sukses Input Valid**
  * **Request Body (JSON)**:
    ```json
    {
      "employeeId": 100,
      "overtimeDate": "2025-06-12",
      "projectName": "WebDev I Frontend Design",
      "startTime": "19:00",
      "endTime": "21:00",
      "totalHours": 2.00
    }
    ```
  * **Expected Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Overtime request submitted successfully",
      "data": {
        "overtimeId": 11,
        "employeeId": 100,
        "projectName": "WebDev I Frontend Design",
        "status": "Request"
      }
    }
    ```
* **Skenario B: Gagal - Karyawan Tidak Terdaftar**
  * **Request Body (JSON)**:
    ```json
    {
      "employeeId": 9999,
      "overtimeDate": "2025-06-12",
      "projectName": "WebDev I",
      "startTime": "19:00",
      "endTime": "21:00",
      "totalHours": 2.00
    }
    ```
  * **Expected Response (404 Not Found)**:
    ```json
    {
      "success": false,
      "message": "Employee with ID 9999 not found."
    }
    ```
* **Skenario C: Gagal - Validasi Format Zod**
  * **Request Body (JSON)**:
    ```json
    {
      "employeeId": 100,
      "overtimeDate": "12-06-2025", 
      "projectName": "A", 
      "startTime": "19:0", 
      "endTime": "21:0", 
      "totalHours": -2.0
    }
    ```
  * **Expected Response (400 Bad Request)**:
    ```json
    {
      "success": false,
      "message": "overtimeDate: Overtime date must be in YYYY-MM-DD format."
    }
    ```

---

### FITUR 2: RIWAYAT & EDIT LEMBUR (Daftar Karyawan & Form Edit)
Digunakan oleh Karyawan untuk memantau status lembur serta memodifikasi pengajuan.

#### 2. GET - Riwayat Lembur Karyawan (Mockup 1 - List View)
* **Method**: `GET`
* **URL**: `http://localhost:3000/api/v1/overtimes?employeeId=100&month=6&year=2025`
* **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Overtimes retrieved successfully",
    "data": [
      {
        "overtimeId": 3,
        "employeeId": 100,
        "employeeName": "Steven King",
        "overtimeDate": "2025-06-01",
        "projectName": "WebDev I",
        "startTime": "19:00",
        "endTime": "21:00",
        "totalHours": 2,
        "status": "Approved",
        "approvedBy": 101,
        "approverName": "Neena Kochhar",
        "notes": "Approved: Selesai pengerjaan sprint 1"
      }
    ]
  }
  ```

#### 3. PUT - Mengubah Data Lembur (Aksi Edit $\rightarrow$ Save)
* **Method**: `PUT`
* **URL**: `http://localhost:3000/api/v1/overtimes/3` *(Ganti angka 3 dengan ID lembur berstatus 'Request')*
* **Headers**: `Content-Type: application/json`
* **Skenario A: Sukses Edit Data Pending**
  * **Request Body (JSON)**:
    ```json
    {
      "projectName": "WebDev I Bug Fixes",
      "totalHours": 2.50
    }
    ```
  * **Expected Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Overtime request updated successfully",
      "data": {
        "overtimeId": 3,
        "employeeId": 100,
        "employeeName": "Steven King",
        "overtimeDate": "2025-06-01",
        "projectName": "WebDev I Bug Fixes",
        "startTime": "19:00",
        "endTime": "21:00",
        "totalHours": 2.5,
        "status": "Request",
        "approvedBy": null,
        "approverName": " ",
        "notes": null
      }
    }
    ```
* **Skenario B: Gagal - Mengedit Lembur yang Sudah Diapprove (Kunci Data)**
  * **URL**: `http://localhost:3000/api/v1/overtimes/1` *(ID 1 memiliki status 'Approved')*
  * **Request Body (JSON)**:
    ```json
    {
      "projectName": "Mencoba Bobol Data"
    }
    ```
  * **Expected Response (400 Bad Request)**:
    ```json
    {
      "success": false,
      "message": "Only overtime requests with 'Request' status can be modified."
    }
    ```

---

### FITUR 3: APPROVAL OLEH ATASAN (MANAGER VIEW)
Digunakan oleh Manager/HRD untuk mengelola pengajuan lembur tim.

#### 4. GET - Semua Daftar Lembur (Manager List)
* **Method**: `GET`
* **URL**: `http://localhost:3000/api/v1/overtimes`
* **Expected Response (200 OK)**:
  Menampilkan semua daftar lembur di departemen/perusahaan lengkap dengan kolom nama karyawan pengaju (`employeeName`).

#### 5. PATCH - Memproses Konfirmasi Approval (Aksi Modal Approval)
* **Method**: `PATCH`
* **URL**: `http://localhost:3000/api/v1/overtimes/3/approve`
* **Headers**: `Content-Type: application/json`
* **Skenario A: Sukses Approve dengan Catatan**
  * **Request Body (JSON)**:
    ```json
    {
      "approvedBy": 101,
      "status": "Approved",
      "notes": "Selesai diuji di server staging"
    }
    ```
  * **Expected Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Overtime request approval status updated successfully",
      "data": {
        "overtimeId": 3,
        "employeeId": 100,
        "employeeName": "Steven King",
        "projectName": "WebDev I Bug Fixes",
        "startTime": "19:00",
        "endTime": "21:00",
        "totalHours": 2.5,
        "status": "Approved",
        "approvedBy": 101,
        "approverName": "Neena Kochhar",
        "notes": "Selesai diuji di server staging"
      }
    }
    ```
* **Skenario B: Gagal - ID Penyetuju Tidak Terdaftar**
  * **Request Body (JSON)**:
    ```json
    {
      "approvedBy": 9999,
      "status": "Approved",
      "notes": "Catatan"
    }
    ```
  * **Expected Response (404 Not Found)**:
    ```json
    {
      "success": false,
      "message": "Approver employee with ID 9999 not found."
    }
    ```

---

### FITUR 4: PEMBATALAN PENGAJUAN (DELETE ACTION)
Karyawan dapat menghapus lembur yang salah diajukan selama belum diproses atasan.

#### 6. DELETE - Menghapus Pengajuan Lembur
* **Method**: `DELETE`
* **URL**: `http://localhost:3000/api/v1/overtimes/3` *(Ganti dengan ID lembur)*
* **Skenario A: Sukses Hapus**
  * **Expected Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Overtime request deleted successfully",
      "data": null
    }
    ```
* **Skenario B: Gagal - Mencoba Hapus Data Terkunci (Status 'Approved')**
  * **URL**: `http://localhost:3000/api/v1/overtimes/1`
  * **Expected Response (400 Bad Request)**:
    ```json
    {
      "success": false,
      "message": "Only overtime requests with 'Request' status can be deleted."
    }
    ```
