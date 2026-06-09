# Panduan Presentasi: Manager Overtime & Approval Modal (No 1-2)

Dokumen ini disusun sebagai materi presentasi untuk menjelaskan bagian **Manager Overtime View** (`https://codeid.id/payroll/overtime/mgr`) beserta **Modal Konfirmasi Approval** yang terintegrasi, mencakup visual, perubahan skema database, kode backend, serta skenario demonstrasi.

---

## 1. Analisis Visual (Daftar Lembur Karyawan & Modal Approval)
Poin-poin presentasi yang perlu ditonjolkan kepada penguji:
* **Halaman Khusus Manager**: Halaman ini diakses oleh atasan (dalam mockup: `Widi`, Role: `[ Manager ]`).
* **Kolom Nama Karyawan (Employee)**: Menampilkan nama masing-masing karyawan yang mengajukan lembur (contoh: `Rima`, `Ali`, `Resi`). Hal ini krusial bagi atasan untuk mengidentifikasi siapa saja yang mengajukan lembur.
* **Modal Konfirmasi Persetujuan (Confirm Approval)**:
  * Terbuka ketika Manager menekan tombol **Edit** (icon pensil) di baris data lembur.
  * Memiliki input **Status** (dengan pilihan: `Approved`, `Pending`, `Cancel`) dan kolom **Notes** (catatan) untuk menulis alasan keputusan (opsional).
  * Tombol **Cancel** dan **Approval** untuk memproses.

---

## 2. Perubahan Desain Database (Skema Oracle)
Jelaskan bahwa seiring ditemukannya input **Notes** pada mockup modal konfirmasi, kami melakukan evolusi skema dengan menambahkan kolom baru:

* **Perintah Migrasi**:
  ```sql
  ALTER TABLE overtimes ADD notes VARCHAR2(255);
  ```
* Kolom `notes` ini bertipe string (`VARCHAR2(255)`) dan bernilai `NULL` secara default hingga manager memberikan catatan persetujuan/penolakan.

---

## 3. Logika Kode Backend

### A. Validasi Catatan (Validation Layer)
Tunjukkan kode Zod schema `approveOvertimeSchema` pada [overtimeValidation.js](file:///e:/Bootcamp/Code%20ID%202026/03.%20Express/express-hr-simple-api/src/validation/overtimeValidation.js) yang membatasi panjang catatan maksimal 255 karakter demi efisiensi memori database:
```javascript
notes: z.string().max(255, "Notes must not exceed 255 characters.").optional()
```

### B. Transaksi & Repositori (Service & Repository Layer)
* **Penyimpanan**: Metode `updateStatus` pada [overtimeRepository.js](file:///e:/Bootcamp/Code%20ID%202026/03.%20Express/express-hr-simple-api/src/repositories/overtimeRepository.js) akan menyisipkan isi catatan tersebut secara langsung dalam query UPDATE.
* **Pengembalian Data**: Query SELECT pada metode `findAll` dan `findById` diperbarui agar kolom `notes` ikut diambil dari database dan dikembalikan ke frontend.

---

## 4. Alur Demonstrasi Pengujian (Live Demo)
Gunakan Postman untuk menunjukkan siklus approval secara transparan:

### Skenario 1: Memeriksa Data Lembur Sebelum Diproses (Status 'Request')
1. Kirim request `GET` ke `/api/v1/overtimes`.
2. Tunjukkan bahwa data lembur yang baru diajukan masih memiliki `"approvedBy": null` dan `"notes": null`.

### Skenario 2: Menyetujui Lembur Beserta Catatan (Aksi Approve)
1. Kirim request `PATCH` ke `/api/v1/overtimes/{id}/approve` (ganti `{id}` dengan ID lembur).
   * **Payload Request (JSON)**:
     ```json
     {
       "approvedBy": 101,
       "status": "Approved",
       "notes": "Selesai pengerjaan bug fixing WebDev I."
     }
     ```
2. Tunjukkan hasil response `200 OK` yang mengembalikan data terupdate:
   ```json
   {
     "success": true,
     "message": "Overtime request approval status updated successfully",
     "data": {
       "overtimeId": 1,
       "employeeId": 100,
       "employeeName": "Steven King",
       "projectName": "WebDev I",
       "status": "Approved",
       "approvedBy": 101,
       "approverName": "Neena Kochhar",
       "notes": "Selesai pengerjaan bug fixing WebDev I."
     }
   }
   ```

### Skenario 3: Uji Coba Keamanan Jika ID Manager Salah (Edge Case)
1. Kirim request `PATCH` yang sama, namun dengan `"approvedBy": 9999` (ID tidak terdaftar).
2. Tunjukkan bahwa sistem menolaknya dengan error `404 Not Found` dan menampilkan pesan: *"Approver employee with ID 9999 not found."*
