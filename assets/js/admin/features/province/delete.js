/**
 * File: assets/js/admin/features/province/delete.js
 * Version: 1.0.2
 * Terakhir Diperbarui: 2024-11-19 18:00:00
 * Deskripsi: Pengelola operasi hapus provinsi dengan integrasi sistem data terpusat
 * 
 * Changelog:
 * v1.0.2 - 2024-11-19
 * - Integrasi dengan sistem manajemen data terpusat
 * - Penyempurnaan validasi sebelum penghapusan
 * - Penambahan pengecekan relasi data
 * - Optimasi penanganan error
 * - Perbaikan cleanup cache setelah hapus
 * 
 * v1.0.1 - 2024-11-17
 * - Penghapusan konfirmasi ganda
 * - Penyederhanaan proses hapus
 * - Perbaikan penanganan error
 * - Penambahan proper cleanup
 */

(function($) {
    'use strict';

    class ProvinceDelete {
        constructor() {
            console.log('[ProvinceDelete] Initializing...');
        }

        /**
         * Validasi data sebelum penghapusan
         */
        validateBeforeDelete(id) {
            if (!id || !this.validateId(id)) {
                console.error('[ProvinceDelete] Invalid ID:', id);
                return false;
            }

            // Cek data dari cache
            const data = irCache.get('provinces', id);
            if (!data) {
                console.error('[ProvinceDelete] Province data not found in cache');
                return false;
            }

            // Cek apakah ada kota yang terkait
            if (data.total_cities > 0) {
                if (!confirm(`Provinsi ini memiliki ${data.total_cities} kota/kabupaten yang akan ikut terhapus. Lanjutkan?`)) {
                    return false;
                }
            }

            return true;
        }

        validateId(id) {
            return Number.isInteger(Number(id)) && id > 0;
        }

        /**
         * Handle operasi delete dengan validasi terpusat
         */
        async delete(id) {
            console.log('[ProvinceDelete] Initiating delete for ID:', id);
            
            // Validasi awal
            if (!this.validateBeforeDelete(id)) {
                return;
            }

            // Konfirmasi standar
            if (!confirm(irSettings.messages.confirmDelete)) {
                return;
            }
            
            try {
                console.log('[ProvinceDelete] Sending delete request...');
                const response = await irAPI.province.delete(id);

                if (response.success) {
                    console.log('[ProvinceDelete] Delete successful');
                    
                    // Clear cache terkait
                    this.cleanupAfterDelete(id);
                    
                    // Notifikasi sukses
                    irToast.success('Provinsi berhasil dihapus');
                    
                    // Trigger callback
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(id);
                    }
                } else {
                    throw new Error(response.data?.message || 'Unknown error during deletion');
                }
            } catch (error) {
                this.handleDeleteError(error, id);
            }
        }

        /**
         * Cleanup resources setelah penghapusan
         */
        cleanupAfterDelete(id) {
            // Clear cache provinsi
            irCache.remove('provinces', id);
            
            // Clear cache terkait (cities, stats, dll)
            this.clearRelatedCache(id);
            
            console.log('[ProvinceDelete] Cache cleanup completed');
        }

        /**
         * Clear cache yang terkait dengan provinsi
         */
        clearRelatedCache(id) {
            // Clear cache cities
            const citiesCache = irCache.get('cities') || {};
            Object.keys(citiesCache).forEach(cityId => {
                if (citiesCache[cityId].province_id === id) {
                    irCache.remove('cities', cityId);
                }
            });
            
            // Clear cache statistik jika ada
            irCache.remove('province_stats', id);
        }

        /**
         * Handle error saat penghapusan
         */
        handleDeleteError(error, id) {
            console.error('[ProvinceDelete] Delete error:', error);
            
            let errorMessage = 'Gagal menghapus provinsi';
            
            // Handle specific error cases
            if (error.response?.data?.code === 'has_dependencies') {
                errorMessage = 'Tidak dapat menghapus provinsi yang masih memiliki data terkait';
            } else if (error.response?.data?.code === 'not_found') {
                errorMessage = 'Provinsi tidak ditemukan';
                // Clear invalid cache
                irCache.remove('provinces', id);
            }
            
            irToast.error(errorMessage);
        }

        // Callback when delete succeeds - to be overridden by ProvinceManager
        onSuccess(id) {
            // Implementation provided by ProvinceManager
        }
    }

    // Export ProvinceDelete
    window.irProvinceDelete = ProvinceDelete;

})(jQuery);
