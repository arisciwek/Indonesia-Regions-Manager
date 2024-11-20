# Rencana Perubahan load data dan pengiriman data ke panel detail

## Pemahaman Masalah
Saat ini terdapat 3 jalur berbeda untuk menampilkan data di panel detail:
1. Klik link nama provinsi di tabel
2. Setelah Create provinsi baru
3. Setelah Update provinsi

Masing-masing menggunakan cara berbeda untuk memuat dan menampilkan data, yang membuat kode tidak konsisten dan sulit dimaintain.

## Tujuan Refactoring
1. Membuat satu fungsi sentral untuk memuat data provinsi
2. Memastikan detail panel selalu diupdate dengan cara yang sama
3. Menghindari refresh halaman penuh
4. Mempertahankan reload DataTable saat perlu (create/update)

## Rencana Implementasi
1. Di ProvinceManager:
   - Buat fungsi sentral `loadAndDisplayProvince(id)`
   - Fungsi ini akan mengambil data dari server via AJAX
   - Fungsi ini akan mengupdate UI di detail.php
   - Fungsi ini akan digunakan oleh semua jalur (link click, create, update)

2. Flow untuk setiap aksi:
   - Klik Link:
     * Tangkap event click
     * Panggil loadAndDisplayProvince
     * Update hash URL
     * Tidak perlu reload table
   
   - Create:
     * Setelah sukses create
     * Reload DataTable
     * Panggil loadAndDisplayProvince dengan ID baru
     * Update hash URL
   
   - Update:
     * Setelah sukses update
     * Reload DataTable
     * Panggil loadAndDisplayProvince dengan ID yang sama
     * Hash URL sudah sesuai, tidak perlu diubah

3. Penanganan UI:
   - Detail panel akan diupdate via DOM manipulation
   - Tabs akan direset ke info tab
   - Loading state akan ditampilkan selama proses
   - Error handling yang konsisten

4. Cache Management:
   - Clear cache setelah create/update
   - Gunakan cache untuk load data jika tersedia

## Expected Benefits
1. Kode lebih maintainable karena menggunakan satu fungsi sentral
2. User experience lebih baik karena tidak ada refresh penuh
3. Konsistensi dalam penanganan data dan UI
4. Error handling yang lebih baik dan terpusat
5. Performa lebih baik dengan penggunaan cache yang tepat

## Pemahaman Existing Hash System
Saya menemukan sistem hash yang sudah terimplementasi:
1. Di DetailPanel (detail-panel.js):
   - Sudah ada listener untuk `hashchange`
   - Menggunakan hash untuk load data provinsi
   - Hash digunakan untuk browser history

2. Di table.js:
   - Setiap nama provinsi di-render sebagai link dengan hash (#id)
   - Saat link diklik, hash URL diupdate

3. Di update.js dan create.js:
   - Setelah operasi sukses, hash diupdate via `irHelper.setHashId()`
   - Perubahan hash ini memicu `hashchange` event

## Revisi Rencana Implementasi
1. Di ProvinceManager:
   - TIDAK perlu menambah event listener hashchange baru
   - Tetap gunakan DetailPanel yang sudah ada untuk handle hash
   - Buat fungsi sentral `loadAndDisplayProvince(id)` yang akan:
     * Dipanggil oleh DetailPanel saat hash berubah
     * Dipanggil langsung untuk kasus yang tidak perlu update hash

2. Flow untuk setiap aksi:
   - Klik Link di Tabel:
     * Biarkan sistem hash existing bekerja
     * DetailPanel akan menangkap perubahan hash
     * DetailPanel akan memanggil loadAndDisplayProvince
   
   - Create:
     * Setelah sukses create
     * Reload DataTable
     * Update hash via irHelper.setHashId()
     * Biarkan sistem hash existing bekerja
   
   - Update:
     * Setelah sukses update
     * Reload DataTable
     * Hash tidak perlu diubah (sudah sesuai)
     * Langsung panggil loadAndDisplayProvince

3. Penanganan Hash:
   - Gunakan sistem hash existing
   - Tidak membuat event listener baru untuk hash
   - Manfaatkan DetailPanel yang sudah menangani hash

4. Penanganan UI dan Cache:
   - Tetap sama seperti rencana sebelumnya
   - Clear cache saat create/update
   - Update UI via DOM manipulation
   - Konsisten dalam error handling

## Keuntungan Tambahan
1. Memanfaatkan sistem yang sudah ada, tidak perlu membuat ulang
2. Menghindari konflik antara multiple hash handlers
3. Tetap mendapatkan manfaat browser history
4. Lebih sedikit kode yang perlu diubah

## Yang Perlu Diubah
1. Sentralisasi fungsi load data di satu tempat
2. Standardisasi cara update UI detail panel
3. Pastikan semua jalur menggunakan sistem hash yang sudah ada
4. Tambahkan proper error handling

# Pemahaman Existing Hash System
Saya menemukan sistem hash yang sudah terimplementasi:
1. Di DetailPanel (detail-panel.js):
   - Sudah ada listener untuk `hashchange`
   - Menggunakan hash untuk load data provinsi
   - Hash digunakan untuk browser history

2. Di table.js:
   - Setiap nama provinsi di-render sebagai link dengan hash (#id)
   - Saat link diklik, hash URL diupdate

3. Di update.js dan create.js:
   - Setelah operasi sukses, hash diupdate via `irHelper.setHashId()`
   - Perubahan hash ini memicu `hashchange` event

# Revisi Rencana Implementasi
1. Di ProvinceManager:
   - TIDAK perlu menambah event listener hashchange baru
   - Tetap gunakan DetailPanel yang sudah ada untuk handle hash
   - Buat fungsi sentral `loadAndDisplayProvince(id)` yang akan:
     * Dipanggil oleh DetailPanel saat hash berubah
     * Dipanggil langsung untuk kasus yang tidak perlu update hash

2. Flow untuk setiap aksi:
   - Klik Link di Tabel:
     * Biarkan sistem hash existing bekerja
     * DetailPanel akan menangkap perubahan hash
     * DetailPanel akan memanggil loadAndDisplayProvince
   
   - Create:
     * Setelah sukses create
     * Reload DataTable
     * Update hash via irHelper.setHashId()
     * Biarkan sistem hash existing bekerja
   
   - Update:
     * Setelah sukses update
     * Reload DataTable
     * Hash tidak perlu diubah (sudah sesuai)
     * Langsung panggil loadAndDisplayProvince

3. Penanganan Hash:
   - Gunakan sistem hash existing
   - Tidak membuat event listener baru untuk hash
   - Manfaatkan DetailPanel yang sudah menangani hash

4. Penanganan UI dan Cache:
   - Tetap sama seperti rencana sebelumnya
   - Clear cache saat create/update
   - Update UI via DOM manipulation
   - Konsisten dalam error handling

# Keuntungan Tambahan
1. Memanfaatkan sistem yang sudah ada, tidak perlu membuat ulang
2. Menghindari konflik antara multiple hash handlers
3. Tetap mendapatkan manfaat browser history
4. Lebih sedikit kode yang perlu diubah

# Yang Perlu Diubah
1. Sentralisasi fungsi load data di satu tempat
2. Standardisasi cara update UI detail panel
3. Pastikan semua jalur menggunakan sistem hash yang sudah ada
4. Tambahkan proper error handling

# Pemahaman Sistem Saat Ini

## Layout & Panel
1. Layout 2 panel:
   - Panel kiri: Tabel provinsi (DataTable)
   - Panel kanan: Detail provinsi (dinamis berdasarkan hash)

## Sistem URL & Hash
1. Format URL:
   - Menu tanpa hash: `/wp-admin/admin.php?page=indonesia-regions`
   - Dengan hash: `/wp-admin/admin.php?page=indonesia-regions#101`

2. Behaviour Hash:
   - URL tanpa hash: panel detail hidden
   - URL dengan hash: panel detail tampil data sesuai ID
   - Hash berubah saat: klik link tabel, create sukses, update sukses

## Kondisi Loading
1. Initial Load (Menu):
   - Dari menu tanpa hash: panel detail hidden
   - Dari URL dengan hash: load dan tampilkan detail sesuai ID

2. CRUD Operations:
   - Create: redirect ke #newId, panel detail tampil data baru
   - Update: redirect ke #editedId, panel detail tampil data update
   - Delete: hapus hash, panel detail hidden

# Rencana Perubahan

## 1. Centralized Data Loading
```
loadAndDisplayProvince(id)
- Single source of truth untuk load data
- Digunakan untuk semua kasus: link click, create, update
- Konsisten dalam error handling
```

## 2. Hash Management
```
- Gunakan sistem hash existing di DetailPanel
- Update hash via irHelper.setHashId()
- Hash triggers loadAndDisplayProvince()
```

## 3. Panel Detail Behavior
```
- Hidden saat tidak ada hash
- Tampil saat ada hash
- Update konten via AJAX tanpa refresh
- Reset ke info tab saat data baru
```

## 4. DataTable Integration
```
- Reload saat create/update
- Pertahankan fungsionalitas server-side
- Konsisten dengan settings existing
```

## 5. State Management
```
- Track current ID untuk optimasi
- Clear cache saat perlu
- Maintain proper loading states
```

# Alur Proses

## Initial Load
1. Cek URL hash
   - Ada hash: load & tampilkan detail
   - Tidak ada hash: panel detail hidden

## Link Click di Table
1. Update hash URL
2. Hash change trigger loadAndDisplayProvince
3. Panel detail update

## Create Success
1. Reload DataTable
2. Update hash ke ID baru
3. loadAndDisplayProvince dengan data baru
4. Panel detail tampil

## Update Success
1. Reload DataTable
2. Update hash ke ID yang diedit
3. loadAndDisplayProvince dengan data update
4. Panel detail update

## Delete Success
1. Reload DataTable
2. Hapus hash
3. Panel detail hidden

# Expected Results
1. Konsistensi dalam load & display data
2. No full page refresh
3. Proper state management
4. Better error handling
5. Improved UX dengan predictable behavior

# Implementasi
- Update ProvinceManager
- Modify DetailPanel bila perlu
- Update Create/Update handlers
- Enhance error handling
- Improve loading states