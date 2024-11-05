/**
 * File: assets/js/admin/features/province/table-solusi-3.js
 * Version: 1.0.1
 * Deskripsi: Perbaikan DataTable reinitialize warning pada ProvinceTable
 * 
 * Changelog:
 * - Penambahan singleton pattern untuk mencegah multiple instance
 * - Perbaikan lifecycle management (init, destroy)
 * - Implementasi proper event cleanup
 * - Perbaikan handling DataTable instance
 */

(function($) {
    'use strict';

    // Private variables untuk singleton pattern
    let instance = null;
    let dataTableInstance = null;

    class ProvinceTable extends irBaseTable {
        constructor() {
            // Implementasi singleton
            if (instance) {
                console.warn('ProvinceTable already initialized, returning existing instance');
                return instance;
            }

            // Destroy existing DataTable jika ada
            if ($.fn.DataTable.isDataTable('#provincesTable')) {
                $('#provincesTable').DataTable().destroy();
                console.info('Destroyed existing DataTable instance');
            }

            // Clear event handlers dari instance sebelumnya
            $('#provincesTable').off();

            // Define table configuration
            const tableConfig = {
                destroy: true, // Enable destroy option
                ajax: {
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: (d) => ({
                        ...d,
                        action: 'ir_get_provinces',
                        nonce: irSettings.nonce
                    })
                },
                columns: [
                    { data: 'id' },
                    { 
                        data: 'name',
                        render: (data, type, row) => {
                            if (type === 'display') {
                                return `<a href="#${row.id}" class="province-link">${data}</a>`;
                            }
                            return data;
                        }
                    },
                    { 
                        data: 'total_cities',
                        searchable: false
                    },
                    { 
                        data: 'created_at',
                        render: (data) => irHelper.formatDate(data)
                    },
                    {
                        data: null,
                        orderable: false,
                        searchable: false,
                        render: (data) => {
                            const actions = new irTableActions({
                                onEdit: () => {},
                                onDelete: () => {}
                            });
                            return actions.renderActions(data);
                        }
                    }
                ],
                order: [[1, 'asc']],
                processing: true,
                serverSide: true,
                responsive: true,
                language: irSettings.dataTable.language
            };

            // Initialize parent
            super('provincesTable', tableConfig);

            // Set instance dan referensi DataTable
            instance = this;
            dataTableInstance = this.datatable;

            // Initialize table actions
            this.actions = new irTableActions({
                onEdit: (id) => this.handleEdit(id),
                onDelete: (id) => this.handleDelete(id)
            });

            this.initializeEvents();

            return instance;
        }

        /**
         * Initialize event handlers dengan proper cleanup
         */
        initializeEvents() {
            const $table = this.$table;

            // Cleanup existing events first
            $table.off('click', '.province-link');
            $table.off('click', '.edit-row');
            $table.off('click', '.delete-row');

            // Re-attach event handlers
            $table.on('click', '.province-link', (e) => {
                e.preventDefault();
                const href = $(e.currentTarget).attr('href');
                if (href) {
                    window.location.hash = href.replace('#', '');
                }
            });

            // Attach action events if actions initialized
            if (this.actions && typeof this.actions.attachEvents === 'function') {
                this.actions.attachEvents($table);
            }

            // Add error handler untuk ajax requests
            this.datatable.on('error.dt', (e, settings, techNote, message) => {
                console.error('DataTable error:', message);
                irToast.error('Gagal memuat data provinsi');
            });
        }

        /**
         * Reload table data dengan preserving state
         */
        reload() {
            if (this.datatable) {
                this.datatable.ajax.reload(null, false);
            }
        }

        /**
         * Proper cleanup saat destroy
         */
        destroy() {
            try {
                // Remove event handlers
                if (this.$table) {
                    this.$table.off();
                }

                // Destroy DataTable instance
                if (this.datatable) {
                    this.datatable.destroy();
                    this.datatable = null;
                }

                // Cleanup actions
                if (this.actions) {
                    this.actions = null;
                }

                // Reset instances
                instance = null;
                dataTableInstance = null;

                console.info('ProvinceTable cleanup successful');
            } catch (error) {
                console.error('Error during ProvinceTable cleanup:', error);
            }
        }

        /**
         * Get current DataTable instance
         */
        static getInstance() {
            return instance;
        }

        /**
         * Handler for edit action
         */
        handleEdit(id) {
            if (typeof this.onEdit === 'function') {
                this.onEdit(id);
            }
        }

        /**
         * Handler for delete action
         */
        handleDelete(id) {
            if (typeof this.onDelete === 'function') {
                this.onDelete(id);
            }
        }

        // Callback methods yang akan di-override ProvinceManager
        onEdit() {}
        onDelete() {}
    }

    // Export ProvinceTable
    window.irProvinceTable = ProvinceTable;

})(jQuery);