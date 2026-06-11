# Panduan Presentasi: Manager Approval & Details Modal (No 2-2)

Dokumen ini disusun sebagai materi presentasi untuk menjelaskan bagian **Manager Business Trip Approval** (`https://codeid.id/payroll/btrips/mgr`), mencakup perubahan skema database Oracle, integrasi logic backend, rincian modal allowance/history, serta skenario live demo.

---

## 1. Analisis Visual & Opsi Manager
Poin-poin presentasi yang perlu ditonjolkan kepada penguji pada dashboard Manager:
* **Halaman Khusus Manager**: Halaman diakses oleh atasan/manager (di mockup: `Widi`, Role: `[ Manager ]`).
* **Fitur Filter & Search**: Menyediakan filter tanggal periode, pencarian nama karyawan/nomor trip, serta filter status (`Approved`, `Process`, `Completed`, `Pending`).
* **Actions Menu (Icon Tiga Titik ⋮)**: Membuka dua opsi aksi krusial:
  1. **Set Approval**: Membuka modal persetujuan dengan dropdown status (`Approved`, `Pending`, `Cancel`) dan input catatan (`Notes`).
  2. **Details**: Membuka modal detail yang berisi tab **Allowances** (rincian tunjangan) dan tab **History** (linimasa persetujuan).

---

## 2. Perubahan Skema Database Oracle
Jelaskan bahwa untuk menampung masukan **catatan persetujuan (Notes)** dari manager, kami melakukan perluasan skema tabel:
* **Kolom Baru**: Kolom `notes` bertipe `VARCHAR2(255)` ditambahkan di tabel `business_trips`.
* **Perintah DDL**:
  ```sql
  ALTER TABLE business_trips ADD notes VARCHAR2(255);
  ```

---

## 3. Logika Backend & Integrasi REST API

### A. Penyimpanan & Transaksi (Service Layer)
* Metode `approveTrip` di [businessTripService.js](file:///e:/Bootcamp/Code%20ID%202026/03.%20Express/express-hr-simple-api/src/services/businessTripService.js) menerima parameter `status` dan `notes`, lalu menyimpannya secara transaksional ke database melalui repositori.
* Data `notes` ini juga ikut di-select pada query list dan detail untuk ditampilkan kembali ke antarmuka pengguna.

---

## 4. Alur Demonstrasi Pengujian (Live Demo)

### Skenario 1: Menyetujui Perjalanan Dinas Beserta Catatan (Approve Action)
1. Kirim request `PATCH` ke `/api/v1/business-trips/{id}/approve` (ganti `{id}` dengan ID perjalanan dinas).
2. Kirim request body berisi manager ID, status, dan notes:
   ```json
   {
     "approvedBy": 102,
     "status": "Approved",
     "notes": "Disetujui untuk pengerjaan project software"
   }
   ```
3. Tunjukkan response `200 OK` sukses yang mengembalikan data terupdate beserta nama approver (`Lex De Haan`) dan `"notes"` yang terisi.

### Skenario 2: Memeriksa Rincian Tunjangan & Riwayat (Details Modal Check)
1. Kirim request `GET` ke `/api/v1/business-trips/{id}`.
2. Tunjukkan pada response detail bahwa:
   * **Tab Allowances**: Nominal tunjangan (Transport, Akomodasi, Harian, Makan) terbagi secara detail dengan perhitungan yang tepat.
   * **Tab History**: Tanggal approval terisi otomatis (`approvedDate`) dan catatan (`notes`) ditampilkan di linimasa.

### Skenario 3: Uji Coba Proteksi Keamanan Pengeditan/Penghapusan (Lock State)
1. Kirim request `DELETE` atau `PUT` ke perjalanan dinas yang sudah disetujui tersebut.
2. Tunjukkan bahwa sistem menolaknya dengan error `400 Bad Request` karena data sudah dikunci (*locked*) setelah statusnya berubah dari `New Request`.
3. Hal ini menjamin integritas data keuangan agar tidak diubah sepihak oleh karyawan setelah disetujui atasan.
