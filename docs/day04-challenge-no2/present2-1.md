# Panduan Presentasi: Form Add & Edit Business Trips (No 2-1)

Dokumen ini disusun sebagai materi presentasi untuk menjelaskan bagian **Form Add | Edit Business Trips** (`https://codeid.id/payroll/btrips/user/add`), mencakup aspek visual, pemetaan database, logika kalkulasi tunjangan otomatis, serta skenario demonstrasi.

---

## 1. Analisis Visual & Input Form
Tunjukkan kepada penguji elemen-elemen penting pada antarmuka input pengajuan perjalanan dinas:
* **Destination**: Input bertipe pencarian (*search box*) untuk menentukan rute keberangkatan dan tujuan (Contoh mockup: `JKT-BDG JAKARTA BANDUNG`).
* **Start Date & End Date**: Input tanggal dilengkapi dengan ikon kalender (*Date Picker*) untuk menentukan durasi perjalanan dinas.
* **Checklist if attend with partner**: 
  * Checkbox interaktif. Jika dicentang, akan menampilkan kotak input pencarian untuk memilih karyawan lain yang ikut serta dalam rombongan (Contoh mockup: `Aji, Budi, Charlie`).
  * Integrasi many-to-many: Input ini memungkinkan penambahan lebih dari satu karyawan ke dalam satu perjalanan dinas.
* **Purpose**: Input berupa textarea berkapasitas besar untuk mendeskripsikan secara lengkap tujuan perjalanan dinas (Contoh mockup: `Meeting with client for development system software`).

---

## 2. Pemetaan & Struktur Relasi Database
Jelaskan bagaimana data yang diinputkan dari form dipetakan ke dalam database Oracle:

* **Tabel Utama `business_trips`**:
  * Menyimpan field dasar: `destination`, `start_date`, `end_date`, dan `purpose`.
  * Durasi hari (`duration_days`) dan rincian tunjangan nominal (`transport_allowance`, `accommodation_allowance`, `daily_allowance`, `meal_allowance`, `total_allowance`) **dihitung secara otomatis di backend** dan disimpan ke tabel ini.
* **Junction Table `business_trip_employees`**:
  * Rombongan/tim yang diisi melalui input *partner* akan disimpan sebagai baris relasi baru di tabel ini, menghubungkan `business_trip_id` dengan masing-masing `employee_id`.

---

## 3. Logika Backend & Otomasi
Jelaskan alur kalkulasi tunjangan otomatis yang terjadi di backend:
* **Durasi Hari**: Dihitung secara inklusif menggunakan rumus: `(endDate - startDate) + 1`.
  * *Contoh*: `12/06/2025` s.d `15/06/2025` = **4 Hari**.
* **Breakdown Tunjangan**:
  * **Transport**: Flat pulang-pergi Rp 1.000.000.
  * **Akomodasi**: Durasi hari $\times$ Rp 350.000 $\rightarrow$ 4 hari $\times$ Rp 350.000 = Rp 1.400.000.
  * **Uang Harian**: Durasi hari $\times$ Rp 100.000 $\rightarrow$ 4 hari $\times$ Rp 100.000 = Rp 400.000.
  * **Uang Makan**: Durasi hari $\times$ Rp 50.000 $\rightarrow$ 4 hari $\times$ Rp 50.000 = Rp 200.000.
  * **Total Tunjangan** = Rp 1.000.000 + Rp 1.400.000 + Rp 400.000 + Rp 200.000 = **Rp 3.000.000**.

---

## 4. Alur Demonstrasi Pengujian (Live Demo)
Gunakan Postman untuk memperagakan proses pembuatan dan perubahan pengajuan perjalanan dinas:

### Skenario 1: Membuat Pengajuan Perjalanan Rombongan (Aksi Add $\rightarrow$ Save)
1. Kirim request `POST` ke `/api/v1/business-trips`.
2. Kirim payload JSON berisi tim:
   ```json
   {
     "destination": "JKT-BDG",
     "purpose": "Meeting with client for development system software",
     "startDate": "2025-06-12",
     "endDate": "2025-06-15",
     "employeeIds": [100, 105, 106]
   }
   ```
3. Tunjukkan response `201 Created` sukses yang mengembalikan status `"New Request"` beserta total kalkulasi allowance sebesar `3000000`.

### Skenario 2: Mengubah Pengajuan yang Belum Disetujui (Aksi Edit $\rightarrow$ Save)
1. Kirim request `PUT` ke `/api/v1/business-trips/{id}`.
2. Ubah tanggal kepulangan menjadi `2025-06-14` (durasi menjadi 3 hari) dan sesuaikan tim:
   ```json
   {
     "endDate": "2025-06-14",
     "employeeIds": [100, 105]
   }
   ```
3. Tunjukkan bahwa backend otomatis menghitung ulang durasi menjadi 3 hari dan total allowance turun menjadi `2500000`.
