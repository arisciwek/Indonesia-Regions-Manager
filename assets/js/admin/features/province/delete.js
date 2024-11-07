/**
 * File: assets/js/admin/features/province/delete.js
 * Version: 1.0.1
 * Description: Province deletion handler
 * 
 * Changelog v1.0.1:
 * - Fix: Removed duplicate confirmation dialog
 * - Fix: Simplified delete process
 * - Fix: Improved error handling and logging
 * - Fix: Added proper cleanup after deletion
 */

(function($) {
    'use strict';

    class ProvinceDelete {
        constructor() {
            // Removed confirmMessage as confirmation is now handled in TableActions
            console.log('[ProvinceDelete] Initializing...');
        }

        async delete(id) {
            console.log('[ProvinceDelete] Deleting province:', id);
            
            try {
                const response = await irAPI.province.delete(id);

                if (response.success) {
                    console.log('[ProvinceDelete] Delete successful');
                    irToast.success('Provinsi berhasil dihapus');
                    
                    // Clear cache
                    irCache.remove('provinces', id);
                    
                    // Trigger callback
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(id);
                    }
                } else {
                    throw new Error(response.data?.message || 'Unknown error during deletion');
                }
            } catch (error) {
                console.error('[ProvinceDelete] Delete error:', error);
                irToast.error('Gagal menghapus provinsi');
            }
        }

        // Callback when delete succeeds - to be overridden by ProvinceManager
        onSuccess(id) {
            // Implementation provided by ProvinceManager
        }
    }

    // Export ProvinceDelete
    window.irProvinceDelete = ProvinceDelete;

})(jQuery);