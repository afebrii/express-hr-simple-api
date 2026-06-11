# Panduan Presentasi: Form Add & Edit Overtime (No 1.1)

Dokumen ini disusun sebagai materi presentasi untuk menjelaskan bagian **Form Add & Edit Overtime** (`https://codeid.id/payroll/overtime/add`), mencakup aspek analisis visual, pemetaan database, logika perhitungan waktu, serta cara mendemonstrasikannya kepada penguji.

---

## 1. Analisis Visual & Elemen Form
Pada halaman ini, fokus utama presentasi adalah bagaimana pengguna (karyawan) berinteraksi dengan form pengajuan lembur:
* **Project Name**: Kolom teks bebas bagi karyawan untuk menuliskan deskripsi proyek/kegiatan yang melatarbelakangi lembur (contoh: `WebDev I` atau `Migration Database`).
* **Created Date**: Pemilihan tanggal pelaksanaan lembur menggunakan komponen *date picker* untuk meminimalisir kesalahan penulisan format tanggal.
* **Start Time & End Time**: Jam mulai dan selesai lembur. Di mockup, format waktu menggunakan format detik (`HH:MM:SS` $\rightarrow$ `07:00:00`).
* **Total Hours**: Field yang dinonaktifkan (*disabled/read-only*). Kolom ini secara dinamis menghitung selisih waktu antara *Start Time* dan *End Time* untuk ditampilkan dalam format waktu (`01:00:00`).
* **Tombol Cancel**: Membatalkan pengisian dan mengarahkan kembali ke daftar riwayat lembur.
* **Tombol Save**: Mengirimkan data ke backend untuk disimpan.

---

## 2. Pemetaan Integrasi Database
Jelaskan bahwa **form ini tidak membutuhkan tabel baru**, melainkan memanipulasi data pada tabel `overtimes` yang telah dibuat pada langkah sebelumnya:

* **Penyimpanan Primary Key**: ID lembur akan digenerate otomatis menggunakan sequence `overtimes_seq.NEXTVAL`.
* **Identitas Pengaju**: `employee_id` tidak perlu diinput oleh user. Backend akan mengambil ID user yang sedang login dari sesi aktif (misalnya Steven King dengan ID `100`).
* **Format Waktu**: Untuk kepraktisan pencarian dan efisiensi penyimpanan di database Oracle, bagian detik (`:SS`) pada input `Start Time` dan `End Time` disarankan untuk di-strip (dihapus) di tingkat frontend atau controller, sehingga tersimpan sebagai string 5 karakter (e.g., `'19:00'`).
* **Total Hours**: Disimpan di database sebagai tipe data angka desimal (`NUMBER(4,2)`) agar mudah dijumlahkan untuk keperluan payroll (contoh: `01:30:00` disimpan sebagai desimal `1.50` jam).

---

## 3. Logika Kode & Validasi Bisnis

### A. Proteksi Status (Guard Logic)
Jelaskan aturan bisnis utama yang tertanam di [overtimeService.js](file:///e:/Bootcamp/Code%20ID%202026/03.%20Express/express-hr-simple-api/src/services/overtimeService.js):
* Ketika pengguna menekan **Save** pada halaman **Edit**, sistem akan memeriksa status lembur tersebut di database terlebih dahulu.
* Jika status sudah berubah dari `Request` menjadi `Approved` atau `Completed`, sistem akan memblokir perubahan tersebut dan mengembalikan error `400 Bad Request` dengan pesan: *"Only overtime requests with 'Request' status can be modified."*
* Hal ini penting untuk mencegah karyawan memanipulasi jam lembur yang sudah disetujui oleh atasan.

---

## 4. Cara Demonstrasi Pengujian (Live Demo)
Untuk menunjukkan kepada penguji bahwa form ini terintegrasi penuh secara sukses, lakukan demonstrasi langkah-langkah berikut (bisa disimulasikan menggunakan Postman):

### Skenario 1: Menyimpan Pengajuan Baru (Aksi Add $\rightarrow$ Save)
1. Kirim request `POST` ke `/api/overtimes` dengan data baru:
   ```json
   {
     "employeeId": 100,
     "overtimeDate": "2025-06-09",
     "projectName": "Mobile Development Project",
     "startTime": "19:00",
     "endTime": "21:00",
     "totalHours": 2.00
   }
   ```
2. Tunjukkan hasil response `201 Created` yang mengembalikan ID baru dan status default `'Request'`.

### Skenario 2: Mengubah Pengajuan yang Masih Pending (Aksi Edit $\rightarrow$ Save)
1. Kirim request `PUT` ke `/api/overtimes/{id}` untuk memperbarui nama proyek:
   ```json
   {
     "projectName": "Mobile Development Revised",
     "totalHours": 2.00
   }
   ```
2. Tunjukkan bahwa data berhasil diperbarui dengan response `200 OK`.

### Skenario 3: Uji Coba Pencegahan Manipulasi Data (Edge Case)
1. Lakukan approve pada data tersebut terlebih dahulu via API (`PATCH /api/overtimes/{id}/approve`).
2. Coba kirim kembali request `PUT` untuk mengubah proyek lembur tersebut.
3. Tunjukkan kepada penguji bahwa sistem **berhasil memblokir** request tersebut dan mengembalikan pesan error: *"Only overtime requests with 'Request' status can be modified."*
