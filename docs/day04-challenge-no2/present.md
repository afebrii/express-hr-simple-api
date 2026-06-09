# Panduan Presentasi: Business Trip Module (No 2)

Dokumen ini disusun sebagai panduan presentasi untuk menjelaskan pengerjaan fitur **Business Trip (Perjalanan Dinas)** (Day 04, Task 2), mencakup hasil analisis mockup, desain skema database relasional (Oracle), implementasi backend (Express.js), serta skenario demonstrasi pengujian.

---

## 1. Analisis Mockup & Alur Bisnis (UI Analysis)
Berikut adalah poin-poin utama dari analisis mockup halaman `https://codeid.id/payroll/btrips/user` yang diimplementasikan:
* **Group Trips (Teams)**: Satu perjalanan dinas dapat dilakukan secara berkelompok oleh beberapa karyawan (ditampilkan koma terpisah, e.g. `Rima, Andri, Beje`). Ini merupakan hubungan **Many-to-Many** antara tabel `employees` dan `business_trips`.
* **Kalkulasi Tunjangan Otomatis (Allowances)**:
  * **Transport**: Tunjangan flat pulang-pergi Rp 1.000.000 (dari Rp 500.000 sekali jalan).
  * **Accommodation**: Rp 350.000 per hari, dikalikan durasi hari perjalanan.
  * **Daily Allowance**: Rp 100.000 per hari.
  * **Meal Allowance**: Rp 50.000 per hari.
  * *Contoh Kalkulasi*: Perjalanan 3 hari $\rightarrow$ Transport (Rp 1.000.000) + Accommodation (3 x Rp 350.000 = Rp 1.050.000) + Daily (3 x Rp 100.000 = Rp 300.000) + Meal (3 x Rp 50.000 = Rp 150.000) = **Rp 2.500.000**.
* **Workflow Status & Timeline**:
  * Pengajuan baru berstatus `New Request`.
  * Disetujui oleh Manager $\rightarrow$ `Approved` (mengisi kolom `approved_by` dan `approved_date`).
  * Diproses oleh Finance $\rightarrow$ `Processed` (mengisi kolom `processed_by` dan `processed_date`).
  * Evidence (bukti fisik perjalanan/nota) hanya dapat diunggah setelah status disetujui (`Approved`, `Processed`, `Completed`).
  * Pengubahan atau penghapusan hanya diizinkan saat status masih `New Request`.

---

## 2. Struktur Tabel Database (Oracle Schema)
Untuk mengakomodasi requirements di atas, kami mengimplementasikan 3 tabel baru beserta 2 sequence di Oracle DB:
1. **`business_trips`**: Menyimpan data utama perjalanan dinas, status, breakdown tunjangan, serta tracking historis (tanggal approval & pemrosesan).
2. **`business_trip_employees`**: Tabel junction untuk menyimpan relasi many-to-many antara perjalanan dinas dan karyawan anggota tim.
3. **`business_trip_evidences`**: Menyimpan data path/URL gambar bukti pengeluaran perjalanan dinas.

*Query relasi teams di dashboard menggunakan fungsi `LISTAGG` Oracle untuk menggabungkan nama anggota tim secara efisien:*
```sql
SELECT LISTAGG(e.first_name || ' ' || e.last_name, ', ') WITHIN GROUP (ORDER BY e.first_name)
FROM business_trip_employees bte
JOIN employees e ON bte.employee_id = e.employee_id
...
```

---

## 3. Implementasi Layered Architecture (Backend Logic)
Kode diimplementasikan dengan mematuhi arsitektur berlapis:
* **Validation Layer (`src/validation/businessTripValidation.js`)**: Memakai **Zod** untuk validasi tipe data payload. Array `employeeIds` divalidasi harus berisi angka positif dengan ukuran minimal 1 orang.
* **Repository Layer (`src/repositories/businessTripRepository.js`)**: Menangani semua query SQL mentah menggunakan library `oracledb`. Mendukung filter pencarian berdasarkan periode tanggal pengajuan (`startDate` - `endDate`) dan filter karyawan (`employeeId`).
* **Service Layer (`src/services/businessTripService.js`)**: Menangani logika bisnis, kalkulasi tunjangan secara presisi berdasarkan rumus selisih hari (`(endDate - startDate) + 1`), serta memvalidasi keberadaan `employeeId` sebelum menyisipkan data dalam suatu transaksi database.
* **Controller & Router Layer**: Mengekspos endpoint API RESTful yang rapi di `/api/v1/business-trips`.

---

## 4. Alur Demonstrasi Pengujian (Live Demo Scenarios)
Saat presentasi, kita akan mendemonstrasikan siklus hidup (lifecycle) lengkap dari perjalanan dinas melalui Postman:

1. **Skenario 1: Pengajuan Perjalanan Dinas Baru**
   * POST request ke `/api/v1/business-trips` dengan menyertakan tim beranggotakan beberapa karyawan (e.g. `[100, 101]`).
   * Tunjukkan response sukses dengan status `New Request` dan total allowance yang dihitung secara dinamis.
2. **Skenario 2: Melihat Detail Tunjangan (Details Modal Check)**
   * GET request ke `/api/v1/business-trips/{id}`.
   * Tunjukkan breakdown tunjangan (transport, akomodasi, makan, harian) dan daftar nama karyawan dalam tim.
3. **Skenario 3: Proses Approval Manager & Pemrosesan Finance**
   * PATCH `/api/v1/business-trips/{id}/approve` $\rightarrow$ Mengubah status menjadi `Approved` oleh Manager.
   * PATCH `/api/v1/business-trips/{id}/process` $\rightarrow$ Mengubah status menjadi `Processed` oleh Finance.
   * Tunjukkan pada GET detail bahwa tanggal persetujuan dan pemrosesan terisi otomatis.
4. **Skenario 4: Upload File Bukti Perjalanan (Evidence)**
   * POST `/api/v1/business-trips/{id}/evidences` untuk mengunggah file bukti pengeluaran.
   * Tunjukkan pada GET detail bahwa bukti fisik tersimpan dan terelasi dengan benar.
5. **Skenario 5: Edge Cases & Error Handling**
   * Mencoba menghapus atau mengedit perjalanan dinas yang sudah berstatus `Approved` atau `Processed` $\rightarrow$ Sistem akan menolaknya dengan error `400 Bad Request`.
   * Mencoba membuat pengajuan dengan ID karyawan yang tidak ada di database $\rightarrow$ Ditolak dengan `404 Not Found`.
