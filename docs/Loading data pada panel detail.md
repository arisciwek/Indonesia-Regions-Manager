Loading data pada panel detail.md

Pendekatan best practices untuk loading data pada panel detail dengan multiple tabs:

1. **Initial Load Strategy**
   - Load hanya data dasar provinsi saat panel dibuka
   - Data minimal yang diperlukan untuk header dan statistik dasar
   - Tidak melakukan inisialisasi datatables atau komponen berat lainnya

2. **Tab Loading Strategy**
Beberapa opsi yang bisa dipertimbangkan:

   a. **Pure Lazy Loading**
   - Load data hanya saat tab diklik pertama kali
   - Pro: Resource efficient
   - Con: Ada delay saat user pertama kali membuka tab
   
   b. **Preload Next Tab**
   - Load tab aktif + preload tab berikutnya
   - Pro: UX lebih smooth
   - Con: Bisa membuang resource jika user tidak membuka tab berikutnya
   
   c. **Progressive Loading**
   - Load data dasar dulu, kemudian load detail secara bertahap
   - Pro: UX balance
   - Con: Kompleksitas implementasi lebih tinggi

3. **State Management Considerations**
   - Bagaimana menangani state ketika user berpindah antar provinsi?
   - Apakah perlu clear state tab saat ganti provinsi?
   - Cache strategy untuk data yang sudah di-load

4. **Memory Management**
   - Bagaimana handle cleanup resources (terutama datatables) saat tab tidak aktif?
   - Berapa lama cache data disimpan?
   - Kapan melakukan destroy dan reinitialize komponen?

5. **Future Enhancement Considerations**
   - Bagaimana struktur code agar mudah menambah tab baru?
   - Standarisasi interface untuk tab baru
   - Event system untuk komunikasi antar tab

Dari opsi-opsi di atas, menurut Anda mana yang lebih sesuai dengan kebutuhan aplikasi Anda? 

Kita bisa mendiskusikan lebih detail tentang:
1. Expected user behavior
2. Rata-rata jumlah data per tab
3. Frekuensi update data
4. Server capacity considerations

Bagaimana pendapat Anda?