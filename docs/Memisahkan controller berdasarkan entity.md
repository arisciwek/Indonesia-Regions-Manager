Memisahkan controller berdasarkan entity.md

1. **File Controller Baru:**
- `includes/Controllers/CityController.php`
  - Berisi semua method terkait city (CRUD, validasi, dll)
  - Memiliki konstruktor sendiri dan dependency injection untuk model

2. **File yang Perlu Dimodifikasi:**

a. `includes/Core/Plugin.php`
```plaintext
- Menambahkan inisialisasi CityController
- Mendefinisikan hooks untuk CityController
- Memastikan proper dependency injection
```

b. `includes/Controllers/ProvinceController.php`
```plaintext
- Menghapus semua method terkait city
- Menghapus hook registration untuk city
- Tetap memuat city form di render_main_page()
```

c. `assets/js/admin/config/constants.js`
```plaintext
- Update endpoint definitions
- Memisahkan constant untuk PROVINCE dan CITY
```

d. `assets/js/admin/modules/api.js`
```plaintext
- Memisahkan API calls ke proper endpoints
- Update namespace untuk city endpoints
```

3. **Impact pada JavaScript Files:**
```plaintext
- Perlu update semua AJAX calls di city/*.js files
- Menyesuaikan endpoint names
- Memastikan nonce validation tetap bekerja
```

4. **File Loader dan Dependency:**
```plaintext
- Memastikan CityController ter-load dengan benar
- Mengelola shared dependencies antara ProvinceController dan CityController
```

5. **Potential Issues yang Perlu Dihandle:**
```plaintext
- Shared validation logic
- Nonce handling
- Permission checks
- Error handling consistency
```

6. **Benefits dari Pemisahan:**
```plaintext
- Code lebih maintainable
- Lebih mudah di-test
- Lebih mudah dikembangkan
- Mengikuti Single Responsibility Principle
- Memudahkan debugging
```

7. **Nama Action yang Perlu Diubah:**
```plaintext
Dari:
- ir_get_cities
- ir_get_city
- ir_create_city
- ir_update_city
- ir_delete_city
- ir_check_city_name

Menjadi:
- ir_city_get_all
- ir_city_get
- ir_city_create
- ir_city_update
- ir_city_delete
- ir_city_check_name
```

Apakah Anda setuju dengan analisis ini? Kita bisa mulai dengan membuat CityController.php terlebih dahulu, atau apakah ada pertimbangan lain yang perlu dibahas?
