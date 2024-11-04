(function($) {
    'use strict';

    class ProvinceDelete {
        constructor() {
            this.confirmMessage = irSettings.messages.confirmDelete;
        }

        async delete(id) {
            if (!confirm(this.confirmMessage)) return;

            try {
                const response = await irAPI.province.delete(id);

                if (response.success) {
                    irToast.success('Provinsi berhasil dihapus');
                    
                    // Clear cache
                    irCache.remove('provinces', id);
                    
                    // Callback
                    this.onSuccess(id);
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                console.error('Delete error:', error);
                irToast.error('Gagal menghapus provinsi');
            }
        }

        // Callback ketika delete success
        onSuccess(id) {
            // Override di ProvinceManager
        }
    }

    // Export ProvinceDelete
    window.irProvinceDelete = ProvinceDelete;

})(jQuery);
