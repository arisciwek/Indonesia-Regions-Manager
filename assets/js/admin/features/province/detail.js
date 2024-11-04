(function($) {
    'use strict';

    class ProvinceDetail {
        constructor() {
            this.panel = new irDetailPanel({
                onLoad: (id) => this.loadDetail(id)
            });
            
            this.currentId = null;
            this.initializeEvents();
        }

        initializeEvents() {
            $('#btnEditProvince').on('click', () => this.onEdit(this.currentId));
            $('#btnDeleteProvince').on('click', () => this.onDelete(this.currentId));
        }

        async loadDetail(id) {
            this.currentId = id;
            
            try {
                const data = await this.loadProvinceData(id);
                if (data) {
                    this.updateDetail(data);
                }
            } catch (error) {
                console.error('Load detail error:', error);
                throw error; // Re-throw untuk ditangani DetailPanel
            }
        }

        async loadProvinceData(id) {
            // Check cache first
            let data = irCache.get('provinces', id);
            
            if (!data) {
                const response = await irAPI.province.get(id);
                if (response.success) {
                    data = response.data;
                    irCache.set('provinces', id, data);
                } else {
                    throw new Error(response.data.message);
                }
            }

            return data;
        }

        updateDetail(data) {
            // Update panel header
            $('#provinceDetailName').text(data.name);
            
            // Update stats
            $('#totalCities').text(data.total_cities);
            $('#createdAt').text(irHelper.formatDate(data.created_at));
            $('#updatedAt').text(irHelper.formatDate(data.updated_at));
        }

        // Callbacks
        onEdit(id) {
            // Override di ProvinceManager
        }

        onDelete(id) {
            // Override di ProvinceManager
        }
    }

    // Export ProvinceDetail
    window.irProvinceDetail = ProvinceDetail;

})(jQuery);
