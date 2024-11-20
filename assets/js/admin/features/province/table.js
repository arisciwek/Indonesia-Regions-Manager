/**
 * File: assets/js/admin/features/province/table.js
 * Version: 1.1.2
 * Terakhir Diperbarui: 2024-11-20 02:00:00
 * Deskripsi: Pengelola tabel provinsi dengan integrasi DataTable dan pengelolaan state
 * 
 * Changelog:
 * v1.1.2 - 2024-11-20
 * - Remove: Tombol lihat dari fallback actions
 * - Fix: Konsistensi dengan TableActions component
 * - Fix: Icon rendering pada fallback actions
 * - Update: Dokumentasi untuk fallback actions
 * 
 * v1.1.1 - 2024-11-20
 * - Fix: Proper initialization of TableActions component
 * - Fix: Error in renderActions method when actions not initialized
 * - Add: Better error handling for action rendering
 * 
 * v1.1.0 - 2024-11-19
 * - Implementasi singleton pattern untuk mencegah multiple instance
 * - Penyempurnaan lifecycle management (init, destroy)
 * - Integrasi dengan centralized data management
 * - Penambahan highlight row aktif
 * - Optimasi reload data
 * - Perbaikan handling event untuk clean up
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

            // Initialize table actions before super()
            const tableActions = new irTableActions({
                onEdit: (id) => this.handleEdit(id),
                onDelete: (id) => this.handleDelete(id),
                permissions: {
                    canEdit: true,
                    canDelete: true
                }
            });

            // Define table configuration
            const tableConfig = {
                destroy: true,
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
                        render: (data, type, row) => this.renderActions(data)
                    }
                ],
                order: [[1, 'asc']],
                processing: true,
                serverSide: true,
                responsive: true,
                language: irSettings.dataTable.language,
                drawCallback: (settings) => {
                    this.handleDrawCallback(settings);
                },
                createdRow: (row, data) => {
                    $(row).attr('data-id', data.id);
                }
            };

            // Initialize parent
            super('provincesTable', tableConfig);

            // Store actions instance
            this.actions = tableActions;

            // Set instance dan referensi DataTable
            instance = this;
            dataTableInstance = this.datatable;

            this.activeRowId = null;
            this.initializeEvents();

            return instance;
        }

        /**
         * Render action buttons dengan proper error handling
         */
        renderActions(data) {
            try {
                // Validate actions component
                if (!this.actions || typeof this.actions.renderActions !== 'function') {
                    console.error('ProvinceTable: Actions component not properly initialized');
                    return this.renderFallbackActions(data);
                }

                // Validate data
                if (!data || !data.id) {
                    console.error('ProvinceTable: Invalid data for actions:', data);
                    return '';
                }

                return this.actions.renderActions(data);
            } catch (error) {
                console.error('ProvinceTable: Error rendering actions:', error);
                return this.renderFallbackActions(data);
            }
        }

        /**
         * Fallback rendering jika ada error
         * Konsisten dengan TableActions - hanya edit dan delete
         */
        renderFallbackActions(data) {
            if (!data || !data.id) return '';
            
            return `
                <div class="ir-table-actions">
                    <button type="button" class="button button-small edit-row" data-id="${data.id}" data-action="edit" title="Edit">
                        <span class="dashicons dashicons-edit"></span>
                        Edit
                    </button>
                    <button type="button" class="button button-small button-link-delete delete-row" data-id="${data.id}" data-action="delete" title="Hapus">
                        <span class="dashicons dashicons-trash"></span>
                        Hapus
                    </button>
                </div>
            `;
        }

        /**
         * Initialize event handlers dengan proper cleanup
         */
        initializeEvents() {
            console.log('ProvinceTable: Initializing events');
            
            const $table = this.$table;

            // Cleanup existing events first
            $table.off('.provinceTable');

            // Attach action events if actions component exists
            if (this.actions) {
                console.log('ProvinceTable: Attaching action events');
                this.actions.attachEvents($table);
            } else {
                // Fallback event handlers
                $table.on('click.provinceTable', '.edit-row', (e) => {
                    const id = $(e.currentTarget).data('id');
                    if (id) this.handleEdit(id);
                });

                $table.on('click.provinceTable', '.delete-row', (e) => {
                    const id = $(e.currentTarget).data('id');
                    if (id) this.handleDelete(id);
                });
            }

            // Add error handler untuk ajax requests
            this.datatable.on('error.dt', (e, settings, techNote, message) => {
                console.error('DataTable error:', message);
                irToast.error('Gagal memuat data provinsi');
            });
        }

        /**
         * Handle callback setelah table di-draw
         */
        handleDrawCallback(settings) {
            if (this.activeRowId) {
                this.highlightRow(this.activeRowId);
            }
        }

        /**
         * Highlight row yang aktif
         */
        highlightRow(id) {
            if (!id) return;

            this.$table.find('tr.active').removeClass('active');
            this.$table.find(`tr[data-id="${id}"]`).addClass('active');
            this.activeRowId = id;
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
                    this.$table.off('.provinceTable');
                }

                // Cleanup actions component
                if (this.actions) {
                    this.actions.destroy && this.actions.destroy();
                    this.actions = null;
                }

                // Destroy DataTable instance
                if (this.datatable) {
                    this.datatable.destroy();
                    this.datatable = null;
                }

                // Reset instances
                instance = null;
                dataTableInstance = null;

                // Reset state
                this.activeRowId = null;

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
         * Handler untuk edit action
         */
        handleEdit(id) {
            if (typeof this.onEdit === 'function') {
                this.onEdit(id);
            } else {
                console.warn('ProvinceTable: No edit handler assigned');
            }
        }

        /**
         * Handler untuk delete action
         */
        handleDelete(id) {
            if (typeof this.onDelete === 'function') {
                this.onDelete(id);
            } else {
                console.warn('ProvinceTable: No delete handler assigned');
            }
        }

        // Callback methods yang akan di-override ProvinceManager
        onEdit() {}
        onDelete() {}
    }

    // Export ProvinceTable
    window.irProvinceTable = ProvinceTable;

})(jQuery);
