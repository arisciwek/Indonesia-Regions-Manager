# Panduan Refactoring: Sistem Loading dan Panel Detail

## Pemahaman Sistem Saat Ini

### Struktur Layout & Panel
- Panel kiri: Tabel provinsi (DataTable)
- Panel kanan: Panel detail provinsi (dinamis berdasarkan hash)

### Pengelolaan URL & Hash
- URL Dasar: `/wp-admin/admin.php?page=indonesia-regions`
- URL Detail: `/wp-admin/admin.php?page=indonesia-regions#[id]`
- Panel detail tersembunyi saat tidak ada hash
- Panel detail menampilkan data sesuai ID saat ada hash

### Sumber ID Provinsi
Sistem mendapatkan ID provinsi dari 3 sumber:
1. ID dari link yang diklik di tabel
2. ID baru dari response setelah create sukses
3. ID yang sedang diedit saat update sukses

## Tujuan Refactoring

### Tujuan Utama
1. Sentralisasi loading data provinsi dalam satu controller
2. Efisiensi loading data dengan sistem bertahap
3. Mempertahankan konteks setelah operasi edit
4. Menghindari refresh halaman penuh
5. Mempertahankan reload DataTable saat diperlukan

### Kebutuhan Teknis
1. Fungsi terpusat untuk loading data provinsi dasar
2. Penyimpanan data provinsi di controller
3. Pengiriman data ke panel detail via ajax
4. Loading terpisah untuk setiap tab
5. Penanganan error yang terstandarisasi

## Rencana Implementasi

### 1. Loading Data Terpusat
- Controller menyediakan fungsi loadDataProvinsi()
- Data disimpan dalam variabel $dataProvinsi
- Hanya memuat data dasar/info provinsi
- Pengiriman ke panel detail via ajax

### 2. Pengelolaan Panel Detail
- Panel detail hanya bertugas menampilkan data
- Tidak melakukan loading data sendiri
- Menerima data dari controller via ajax
- Update tampilan tanpa reload halaman

### 3. Pengelolaan Tab
- Tab Info:
  * Menggunakan data yang sudah dimuat di awal
  * Menampilkan informasi dasar provinsi

- Tab Kabupaten/Kota:
  * Inisialisasi DataTables saat tab dibuka
  * Loading data cities terpisah via ajax
  * Pengaturan DataTables khusus untuk cities
  * ini pengembangan berikutnya setelah provinsi selesai


- Tab Statistik:
  * Load data statistik saat tab dibuka
  * Ajax terpisah untuk data statistik
  * ini pengembangan berikutnya setelah provinsi selesai

### 4. Pengelolaan State Setelah Operasi

#### Create Sukses
1. Reload DataTable provinsi
2. Update hash ke ID baru
3. Load dan tampilkan data provinsi baru

#### Update Sukses
1. Reload DataTable provinsi
2. Tetap di ID yang sedang diedit
3. Load dan tampilkan data provinsi yang diupdate
4. Tidak mengubah hash URL, tapi di redirect ke ID yang diedit

#### Delete Sukses
1. Reload DataTable provinsi
2. Hapus hash
3. Sembunyikan panel detail

## Implementasi Loading Bertahap

### 1. Loading Data Dasar
```php
// Di controller
public function loadDataProvinsi($id) {
    // Load hanya data dasar provinsi
    // Simpan di $dataProvinsi
    // Kirim ke panel detail
}
```

### 2. Loading Data Tab
```javascript
// Di panel detail
tabClickHandler() {
    switch(tabId) {
        case 'cities':
            // Inisialisasi DataTable cities jika belum
            // Load data cities via ajax
            break;
        case 'stats':
            // Load data statistik via ajax
            break;
    }
}
```

## Hasil yang Diharapkan
1. Loading data yang efisien dan bertahap
2. Pengalaman pengguna yang lebih baik saat edit data
3. Performa yang optimal dengan loading terpisah
4. Konsistensi data antar panel
5. Navigasi yang natural sesuai konteks operasi

## Panduan Migrasi
1. Pindahkan logika loading ke controller
2. Implementasikan sistem loading bertahap
3. Sesuaikan panel detail untuk menerima data via ajax
4. Implementasikan loading terpisah per tab
5. Pastikan hash tidak berubah setelah edit