(function($) {
    'use strict';

    class ProvinceManager {
        constructor() {
            this.create = new irProvinceCreate();
            this.update = new irProvinceUpdate();
            this.delete = new irProvinceDelete();
            this.table = new irProvinceTable();
            this.detail = new irProvinceDetail();

            this.initializeCallbacks();
            this.initializeEvents();
        }

        initializeCallbacks() {
            // Create callbacks
            this.create.onSuccess = (data) => {
                this.table.reload();
                irHelper.setHashId(data.id);
            };

            // Update callbacks
            this.update.onSuccess = (id) => {
                this.table.reload();
                if (this.detail.currentId === id) {
                    this.detail.loadDetail(id);
                }
            };

            // Delete callbacks
            this.delete.onSuccess = (id) => {
                this.table.reload();
                if (this.detail.currentId === id) {
                    irHelper.setHashId('');
                }
            };

            // Table callbacks
            this.table.onEdit = (id) => this.update.show(id);
            this.table.onDelete = (id) => this.delete.delete(id);

            // Detail callbacks
            this.detail.onEdit = (id) => this.update.show(id);
            this.detail.onDelete = (id) => this.delete.delete(id);
        }

        initializeEvents() {
            // Add province button
            $('#btnAddProvince').on('click', () => this.create.show());
        }
    }

    // Export ProvinceManager
    window.irProvinceManager = ProvinceManager;

})(jQuery);
