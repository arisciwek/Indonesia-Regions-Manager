Validasi yang bisa di form.js (client-side paling awal):
1. Empty/required check - karena ini validasi paling basic dan sama untuk semua form
2. Min/max length - karena ini batasan UI yang konsisten
3. Pattern/format (huruf & spasi) - karena ini juga aturan input yang konsisten
4. Validasi realtime saat ketik (on input/change)

Alasan pemindahan ke form.js:
1. Fail fast - user langsung dapat feedback tanpa perlu tunggu submit
2. Konsisten - validasi basic sama untuk create/update
3. Mengurangi duplikasi kode di create.js dan update.js
4. Single source of truth untuk validasi dasar

Yang tetap di create.js/update.js:
1. Validasi bisnis logic khusus (jika ada)
2. Pengecekan duplikat - karena perlu konteks (ID saat update)
3. Validasi yang butuh data dari server
4. Validasi yang spesifik untuk create atau update

Dengan begini:
1. form.js handle semua validasi basic
2. create/update hanya handle validasi yang benar-benar spesifik
3. Server tetap validasi semuanya sebagai safety net

