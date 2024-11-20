# Panduan Lengkap Refactoring Plugin Indonesia Region 
Version: 1.2
Last Updated: 2024-11-19 14:30:00

## Changelog:
v1.2 (2024-11-19):
- Added fourth source of province ID from direct URL access
- Added handling for direct URL access validation
- Enhanced error handling scenarios
- Added specific validation requirements per ID source

v1.1 (2024-11-17):
- Initial documented version
- Basic structure and implementation plan
- Three sources of province ID documented

## I. Pemahaman Sistem Saat Ini

### A. Struktur Layout & Panel
1. Layout 2 panel:
   - Panel kiri: Tabel provinsi (DataTable)
   - Panel kanan: Detail provinsi (dinamis berdasarkan hash)

### B. Pengelolaan URL & Hash
1. Format URL:
   - Menu tanpa hash: `/wp-admin/admin.php?page=indonesia-regions`
   - Dengan hash: `/wp-admin/admin.php?page=indonesia-regions#[id]`
2. Behaviour Hash:
   - URL tanpa hash: panel detail hidden
   - URL dengan hash: panel detail tampil data sesuai ID
   - Hash berubah saat: klik link tabel, create sukses, update sukses

### C. Sumber ID Provinsi
Sistem mendapatkan ID provinsi dari 4 sumber:
1. ID dari link yang diklik di tabel
2. ID baru dari response setelah create sukses
3. ID yang sedang diedit saat update sukses
4. ID dari direct URL access (ketika user mengakses URL dengan hash langsung)

Karakteristik dan Penanganan per Sumber ID:
- Untuk #1: ID sudah tervalidasi karena ada di tabel
- Untuk #2: ID pasti valid karena baru dibuat
- Untuk #3: ID pasti valid karena sedang diedit
- Untuk #4: ID perlu divalidasi karena bisa saja invalid atau provinsi sudah dihapus

## II. Tujuan Refactoring

### A. Tujuan Utama
1. Sentralisasi loading data provinsi dalam satu controller
2. Efisiensi loading data dengan sistem bertahap
3. Mempertahankan konteks setelah operasi edit
4. Menghindari refresh halaman penuh
5. Mempertahankan reload DataTable saat diperlukan

### B. Tujuan Teknis
1. Single source of truth untuk load data
2. Konsistensi dalam update UI
3. Optimasi performa dengan cache
4. Error handling yang terstandarisasi
5. Pengelolaan state yang lebih baik

## III. Rencana Implementasi

### A. Centralized Data Loading
```javascript
class ProvinceManager {
    async loadAndDisplayProvince(id) {
        try {
            // Check cache first
            let data = irCache.get('provinces', id);
            
            if (!data) {
                data = await this.loadFromServer(id);
                irCache.set('provinces', id, data);
            }
            
            this.updateDetailPanel(data);
        } catch (error) {
            this.handleError(error);
        }
    }
}
```

### B. Cache Management
1. Implementasi Cache:
   ```javascript
   const cache = {
       provinces: {},
       clearCache() {
           this.provinces = {};
       },
       get(key, id) {
           return this.provinces[id] || null;
       },
       set(key, id, data) {
           this.provinces[id] = data;
       }
   }
   ```
2. Cache Invalidation:
   - Clear cache setelah create/update/delete
   - Refresh cache setelah operasi yang mengubah data
   - Validasi umur cache untuk data yang sensitif waktu

### C. Detail Panel Management
1. Panel Initialization:
   ```javascript
   class DetailPanel {
       initialize() {
           this.bindHashChange();
           this.initializeTabs();
           this.setupEventListeners();
       }
       
       bindHashChange() {
           $(window).on('hashchange', () => this.handleHashChange());
       }
   }
   ```

2. Tab System:
   ```javascript
   handleTabChange(tabId) {
       switch(tabId) {
           case 'info':
               this.showBasicInfo();
               break;
           case 'cities':
               this.loadCitiesData();
               break;
           case 'stats':
               this.loadStatistics();
               break;
       }
   }
   ```

### D. State Management After Operations
1. Create Success:
   ```javascript
   handleCreateSuccess(newId) {
       this.reloadDataTable();
       irCache.clearCache();
       irHelper.setHashId(newId);
   }
   ```

2. Update Success:
   ```javascript
   handleUpdateSuccess(id) {
       this.reloadDataTable();
       irCache.remove('provinces', id);
       this.loadAndDisplayProvince(id);
   }
   ```

3. Delete Success:
   ```javascript
   handleDeleteSuccess() {
       this.reloadDataTable();
       irHelper.setHashId('');
       this.hideDetailPanel();
   }
   ```

4. Direct URL Access:
   - Validasi ID provinsi
   - Jika valid, load dan tampilkan detail
   - Jika tidak valid, tampilkan error dan clear hash
   - Update tabel untuk highlight row yang sesuai

### E. Error Handling
1. Centralized Error Handler:
   ```javascript
   class ErrorHandler {
       handleError(error, context) {
           console.error(`[${context}] Error:`, error);
           
           if (error.response) {
               irToast.error(error.response.message || 'Server error');
           } else if (error.network) {
               irToast.error('Network error. Please check your connection.');
           } else {
               irToast.error('An unexpected error occurred');
           }
       }
   }
   ```

2. Implementation in Components:
   ```javascript
   async loadData() {
       try {
           // ... loading logic
       } catch (error) {
           ErrorHandler.handleError(error, 'DataLoading');
           throw error; // Re-throw for upstream handling if needed
       }
   }
   ```

3. Validation Errors:
   - Invalid ID dari direct URL access
   - Provinsi tidak ditemukan
   - User tidak punya akses
   - Network errors
   - Server errors

## IV. Expected Results

### A. Peningkatan Performa
1. Loading data yang lebih efisien dengan cache
2. Mengurangi request ke server
3. Update UI yang lebih cepat dengan DOM manipulation

### B. User Experience
1. Navigasi yang lebih natural
2. Feedback yang lebih baik saat error
3. Loading state yang jelas
4. Konsistensi data antar panel

### C. Code Quality
1. Kode yang lebih maintainable
2. Error handling yang lebih baik
3. State management yang lebih predictable
4. Pemisahan concern yang lebih jelas

## V. Implementation Steps

1. Phase 1: Core Infrastructure
   - Implement centralized data loading
   - Setup cache system
   - Create error handling infrastructure

2. Phase 2: UI Components
   - Update DetailPanel implementation
   - Implement tab system
   - Setup DOM manipulation helpers

3. Phase 3: State Management
   - Implement hash management
   - Setup state tracking
   - Create operation handlers

4. Phase 4: Testing & Optimization
   - Test all scenarios
   - Optimize performance
   - Add logging and monitoring
   - Document all changes

## VI. Monitoring & Maintenance

1. Performance Metrics:
   - Loading time tracking
   - Cache hit ratio
   - Error rate monitoring

2. User Feedback:
   - Error reporting
   - Usage patterns
   - Performance issues

3. Maintenance Tasks:
   - Regular cache cleanup
   - Error log review
   - Performance optimization
   - Code updates based on feedback

## Dokumen Terkait:
- Previous Version: v1.1 (2024-11-17)
- Technical Specification: /docs/tech-spec-v1.2.md
- Deployment Guide: /docs/deploy-v1.2.md


