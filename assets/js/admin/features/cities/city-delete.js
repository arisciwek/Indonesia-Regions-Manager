/**
 * File: assets/js/admin/features/cities/city-delete.js
 * Version: 1.0.0
 * Description: Delete handler untuk kota/kabupaten
 * 
 * Changelog:
 * - v1.0.0: Initial release
 *   * Implementasi delete operation untuk city
 *   * Integrasi dengan city API endpoints
 *   * Cache management untuk deleted items
 */

(function($) {
    'use strict';

    class CityDelete {
        constructor(provinceId) {
            console.log('[CityDelete] Initializing with province ID:', provinceId);
            
            this.provinceId = provinceId;
            this.confirmMessage = irConstants.MESSAGES.CITY.CONFIRM_DELETE;
        }

        /**
         * Handle city deletion dengan konfirmasi
         */
        async delete(id) {
            console.log('[CityDelete] Delete requested for ID:', id);

            if (!confirm(this.confirmMessage)) {
                console.log('[CityDelete] Delete cancelled by user');
                return;
            }

            try {
                console.log('[CityDelete] Sending delete request');
                
                const response = await irAPI.city.delete(id);

                if (response.success) {
                    console.log('[CityDelete] Delete successful');
                    irToast.success(irConstants.MESSAGES.CITY.DELETE_SUCCESS);
                    
                    // Clear cache untuk city yang dihapus
                    const cacheKey = `${irConstants.CACHE_KEYS.CITY}_${this.provinceId}`;
                    irCache.remove(cacheKey, id);
                    
                    // Trigger callback
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(id);
                    }
                } else {
                    throw new Error(response.data?.message || 'Delete failed');
                }
            } catch (error) {
                console.error('[CityDelete] Delete error:', error);
                irToast.error(error.message || 'Gagal menghapus data');
            }
        }

        /**
         * Update province ID
         */
        setProvinceId(provinceId) {
            if (this.provinceId !== provinceId) {
                console.log('[CityDelete] Updating province ID:', provinceId);
                this.provinceId = provinceId;
            }
        }

        /**
         * Callback yang akan di-override CityManager
         */
        onSuccess(id) {}
    }

    // Export CityDelete
    window.irCityDelete = CityDelete;

})(jQuery);