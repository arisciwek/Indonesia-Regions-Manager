/**
 * File: assets/js/admin/features/cities/city-table.js
 * Version: 1.0.0
 * Description: DataTable manager untuk mengelola data kota/kabupaten
 * 
 * Changelog:
 * - v1.0.0: Initial release
 *   * Implementasi DataTable untuk cities 
 *   * Table filter berdasarkan province_id
 *   * Integrasi dengan city endpoints
 *   * Implementasi singleton pattern
 *   * Event handling dan lifecycle management
 */

(function($) {
    'use strict';

    // Private variables untuk singleton pattern
    let instance = null;
    let dataTableInstance = null;

    class CityTable extends irBaseTable {
        constructor(provinceId) {
            // Implementasi singleton
            if (instance) {
                console.warn('[CityTable] Already initialized, returning existing instance');
                instance.setProvinceId(provinceId);
                return instance;
            }

            // Destroy existing DataTable jika ada
            if ($.fn.DataTable.isDataTable(irConstants.SELECTORS.CITY.TABLE)) {
                $(irConstants.SELECTORS.CITY.TABLE).DataTable().destroy();
                console.info('[CityTable] Destroyed existing DataTable instance');
            }

            // Clear event handlers dari instance sebelumnya
            $(irConstants.SELECTORS.CITY.TABLE).off();

            // Define table configuration
            const tableConfig = {
                destroy: true,
                ajax: {
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: (d) => ({
                        ...d,
                        action: irConstants.ENDPOINTS.CITY.LIST,
                        province_id: provinceId,
                        nonce: irSettings.nonce
                    })
                },
                columns: [
                    { data: 'id' },
                    { data: 'name' },
                    { 
                        data: 'type',
                        render: (data) => {
                            return data === 'kabupaten' ? 'Kabupaten' : 'Kota';
                        }
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
            super(irConstants.SELECTORS.CITY.TABLE.substring(1), tableConfig);

            // Set instance dan referensi DataTable
            instance = this;
            dataTableInstance = this.datatable;
            this.provinceId = provinceId;

            // Initialize table actions
            this.actions = new irTableActions({
                onEdit: (id) => this.handleEdit(id),
                onDelete: (id) => this.handleDelete(id)
            });

            this.initializeEvents();

            return instance;
        }

        /**
         * Set province ID dan reload table
         */
        setProvinceId(provinceId) {
            if (this.provinceId !== provinceId) {
                console.log('[CityTable] Setting province ID:', provinceId);
                this.provinceId = provinceId;
                this.reload();
            }
        }

        /**
         * Initialize event handlers dengan proper cleanup
         */
        initializeEvents() {
            console.log('[CityTable] Initializing event handlers');
            const $table = this.$table;

            // Cleanup existing events first
            $table.off('click', '.edit-row');
            $table.off('click', '.delete-row');

            // Attach action events if actions initialized
            if (this.actions && typeof this.actions.attachEvents === 'function') {
                this.actions.attachEvents($table);
            }

            // Add error handler untuk ajax requests
            this.datatable.on('error.dt', (e, settings, techNote, message) => {
                console.error('[CityTable] DataTable error:', message);
                irToast.error(irConstants.MESSAGES.CITY.ERROR_LOADING);
            });
        }

        /**
         * Reload table data dengan preserving state
         */
        reload() {
            console.log('[CityTable] Reloading table data');
            if (this.datatable) {
                this.datatable.ajax.reload(null, false);
            }
        }

        /**
         * Proper cleanup saat destroy
         */
        destroy() {
            console.log('[CityTable] Destroying instance');
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

                console.info('[CityTable] Cleanup successful');
            } catch (error) {
                console.error('[CityTable] Error during cleanup:', error);
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

        // Callback methods yang akan di-override CityManager
        onEdit() {}
        onDelete() {}
    }

    // Export CityTable
    window.irCityTable = CityTable;

})(jQuery);