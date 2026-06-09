# Analisis Mockup & Desain Integrasi: Add / Edit Overtime (No 1.1)

Dokumen ini berisi analisis mendalam terhadap mockup halaman **Add | Edit Overtime** (`https://codeid.id/payroll/overtime/add`), pemetaan ke skema database yang sudah ada, serta penjelasan integrasi dengan REST API.

---

## 1. Analisis Elemen UI/Mockup
Berdasarkan mockup halaman pengisian lembur, berikut adalah komponen antarmuka yang teridentifikasi:

### A. Komponen Form Pengisian
1. **Project Name**: Input teks untuk mendeskripsikan proyek yang dikerjakan saat lembur (Contoh: `Mobile Development Project`).
2. **Created Date**: Input tanggal dilengkapi dengan ikon kalender (*Date Picker*) untuk menentukan tanggal pelaksanaan lembur.
3. **Start Time**: Input waktu mulai lembur (Tercantum format `HH:MM:SS` yaitu `07:00:00`).
4. **End Time**: Input waktu selesai lembur (Tercantum format `HH:MM:SS` yaitu `08:00:01`).
5. **Total Hours**: Kolom non-aktif (*disabled*) yang menampilkan durasi lembur (Tercantum format waktu `01:00:00`).

### B. Tombol Aksi
* **Cancel**: Membatalkan pengisian dan kembali ke halaman riwayat lembur.
* **Save**: Menyimpan data pengajuan baru (jika halaman *Add*) atau menyimpan perubahan (jika halaman *Edit*).

---

## 2. Pemetaan Database (Database Mapping)
Untuk halaman **Add | Edit Overtime**, kita **tidak perlu membuat tabel baru**. Seluruh field input di halaman ini telah didukung sepenuhnya oleh tabel `overtimes` dan sequence `overtimes_seq` yang kita buat pada tahap sebelumnya.

Berikut adalah pemetaan dari elemen form UI ke kolom tabel `overtimes`:

| Elemen Form UI | Tipe Elemen UI | Kolom Target di DB | Tipe Data DB | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| *System Value* | *Hidden / Session* | `overtime_id` | `NUMBER` | Diisi otomatis menggunakan sequence `overtimes_seq.NEXTVAL` |
| *Session User* | *Hidden / Auth* | `employee_id` | `NUMBER` | Diambil dari ID user yang sedang login (e.g., `100` untuk Steven) |
| **Created Date** | Date Picker | `overtime_date` | `DATE` | Tanggal pengerjaan lembur (format internal: `YYYY-MM-DD`) |
| **Project Name** | Text Input | `project_name` | `VARCHAR2(100)`| Deskripsi proyek lembur |
| **Start Time** | Time Input | `start_time` | `VARCHAR2(5)` | Disimpan sebagai string format `HH:MI` (e.g., `'19:00'`) |
| **End Time** | Time Input | `end_time` | `VARCHAR2(5)` | Disimpan sebagai string format `HH:MI` (e.g., `'21:00'`) |
| **Total Hours** | Disabled Field | `total_hours` | `NUMBER(4,2)` | Jam desimal (e.g. `2.00` jam) hasil konversi durasi |
| *System Default*| *Auto-set* | `status` | `VARCHAR2(20)` | Otomatis diisi `'Request'` saat pengajuan pertama |
| *System Default*| *Auto-set* | `approved_by` | `NUMBER` | Bernilai `NULL` sampai diproses oleh atasan |

---

## 3. Desain Integrasi REST API

Aksi **Save** pada form ini terhubung ke dua skenario endpoint API tergantung pada konteks halaman:

### A. Skenario Add (Pengajuan Baru)
Ketika user mengisi form kosong lalu menekan tombol **Save**, aplikasi frontend mengirimkan request `POST`:
* **HTTP Method**: `POST`
* **Endpoint**: `/api/v1/overtimes`
* **Payload Request (JSON)**:
  ```json
  {
    "employeeId": 100,
    "overtimeDate": "2025-06-09",
    "projectName": "ERP System Integration",
    "startTime": "19:00",
    "endTime": "21:00",
    "totalHours": 2.00
  }
  ```
* **Kalkulasi Jam (Frontend/Client-side)**:
  Sebelum mengirim data ke backend, frontend menghitung selisih antara `endTime` dan `startTime` untuk menghasilkan angka desimal `totalHours`. 
  * *Contoh*: Selisih dari `19:00` sampai `21:00` adalah 2 jam $\rightarrow$ dikirim sebagai `2.00` ke backend.

---

### B. Skenario Edit (Ubah Pengajuan)
Ketika user menekan tombol edit pada halaman riwayat, form akan terisi dengan data lama. Saat data diubah dan tombol **Save** ditekan, aplikasi mengirimkan request `PUT`:
* **HTTP Method**: `PUT`
* **Endpoint**: `/api/v1/overtimes/:id`
* **Payload Request (JSON)**:
  ```json
  {
    "projectName": "ERP System Integration Revised",
    "startTime": "19:00",
    "endTime": "22:00",
    "totalHours": 3.00
  }
  ```
* **Proteksi Validasi Bisnis (di Backend)**:
  Backend akan menolak (`400 Bad Request`) jika request `PUT` ini dikirim untuk data lembur yang statusnya sudah bukan `Request` lagi (misal sudah `Approved`).

---

## 4. Catatan Penting Perbedaan Desain (Mockup List vs Add)
* **Format Waktu & Detik**:
  * Pada mockup daftar lembur (No 1), jam ditampilkan dalam format `HH:MM` (contoh: `07:00`).
  * Pada mockup form pengisian (No 1.1), input jam dan durasi memiliki kolom detik `HH:MM:SS` (contoh: `07:00:00` dan `08:00:01`).
* **Rekomendasi Penanganan**:
  Demi kepraktisan penyimpanan di database dan konsistensi data, **sangat direkomendasikan** untuk men-strip detik (`:SS`) pada tingkat aplikasi sebelum disimpan ke database, sehingga data tetap tersimpan sebagai `HH:MM` dengan panjang 5 karakter (e.g. `'19:00'`) yang ramah terhadap pencarian dan pengelompokan laporan.
