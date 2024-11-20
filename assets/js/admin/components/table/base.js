/**
 * File: assets/js/admin/components/table/base.js
 * Version: 1.0.2
 * Terakhir Diperbarui: 2024-11-19 19:30:00
 * Deskripsi: Komponen dasar tabel dengan integrasi DataTables, pengelolaan state, dan optimasi performa
 * 
 * Changelog:
 * v1.0.2 - 2024-11-19
 * - Implementasi system state management terintegrasi
 * - Penambahan metode lifecycle management
 * - Optimasi render dan performa DataTables
 * - Perbaikan mekanisme refresh data
 * - Penambahan fitur selection tracking
 * - Penyempurnaan error handling
 * 
 * v1.0.1 - 2024-11-17
 * - Perbaikan inisialisasi DataTables
 * - Penambahan opsi konfigurasi default
 * - Optimasi event handling
 * 
 * v1.0.0 - 2024-11-15
 * - Initial release
 */

(function($) {
    'use strict';

    class BaseTable {
        constructor(tableId, options = {}) {
            this.tableId = tableId;
            this.$table = $(`#${tableId}`);
            
            // State management
            this.state = {
                isInitialized: false,
                isLoading: false,
                selectedRows: new Set(),
                lastUpdate: null,
                searchTerm: '',
                currentPage: 1
            };

            // Merge dengan default options
            this.options = {
                processing: true,
                serverSide: true,
                responsive: true,
                stateSave: true,
                pageLength: 10,
                deferRender: true,
                searchDelay: 500,
                language: {
                    processing: '<div class="ir-loading"><div class="spinner"></div></div>',
                    lengthMenu: 'Tampilkan _MENU_ data per halaman',
                    zeroRecords: 'Data tidak ditemukan',
                    info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ data',
                    infoEmpty: 'Menampilkan 0 sampai 0 dari 0 data',
                    infoFiltered: '(difilter dari _MAX_ total data)',
                    search: 'Cari:',
                    paginate: {
                        first: 'Pertama',
                        last: 'Terakhir',
                        next: 'Selanjutnya',
                        previous: 'Sebelumnya'
                    }
                },
                drawCallback: (settings) => this.handleDrawCallback(settings),
                preDrawCallback: (settings) => this.handlePreDraw(settings),
                initComplete: (settings, json) => this.handleInitComplete(settings, json),
                ...options
            };

            this.validateStructure();
            this.initialize();
        }

        validateStructure() {
            if (!this.$table.length) {
                console.error(`BaseTable: Table with ID "${this.tableId}" not found`);
                throw new Error('Table element not found');
            }

            if (!$.fn.DataTable) {
                console.error('BaseTable: DataTables library not loaded');
                throw new Error('DataTables not available');
            }
        }

        initialize() {
            try {
                // Destroy existing instance if any
                if ($.fn.DataTable.isDataTable(this.$table)) {
                    this.$table.DataTable().destroy();
                }

                // Initialize DataTable
                this.datatable = this.$table.DataTable(this.options);
                this.state.isInitialized = true;

                // Initialize events setelah DataTable siap
                this.initializeEvents();

                // Log success
                console.log(`[BaseTable] Table ${this.tableId} initialized successfully`);

            } catch (error) {
                console.error('[BaseTable] Initialization error:', error);
                this.handleError(error);
            }
        }

        initializeEvents() {
            // Cleanup existing events
            this.cleanupEvents();

            // Selection handling
            this.$table.on('click.baseTable', 'tbody tr', (e) => {
                this.handleRowClick(e);
            });

            // Search input handling dengan debounce
            this.$table.closest('.dataTables_wrapper')
                .find('.dataTables_filter input')
                .off('keyup.baseTable')
                .on('keyup.baseTable', this.debounce(() => {
                    this.state.searchTerm = this.datatable.search();
                    this.state.currentPage = this.datatable.page();
                }, 500));

            // Page change tracking
            this.datatable.on('page.dt', () => {
                this.state.currentPage = this.datatable.page();
            });
        }

        handleRowClick(e) {
            const $row = $(e.currentTarget);
            const rowId = $row.data('id');

            if (rowId) {
                if (e.ctrlKey || e.metaKey) {
                    // Toggle selection
                    if (this.state.selectedRows.has(rowId)) {
                        this.state.selectedRows.delete(rowId);
                        $row.removeClass('selected');
                    } else {
                        this.state.selectedRows.add(rowId);
                        $row.addClass('selected');
                    }
                } else {
                    // Single selection
                    this.$table.find('tr.selected').removeClass('selected');
                    this.state.selectedRows.clear();
                    this.state.selectedRows.add(rowId);
                    $row.addClass('selected');
                }

                this.onSelectionChange([...this.state.selectedRows]);
            }
        }

        handleDrawCallback(settings) {
            this.state.lastUpdate = new Date();
            this.restoreSelection();
            this.onAfterDraw(settings);
        }

        handlePreDraw(settings) {
            this.state.isLoading = true;
            this.onBeforeDraw(settings);
            return true;
        }

        handleInitComplete(settings, json) {
            this.state.isLoading = false;
            this.onInitComplete(settings, json);
        }

        restoreSelection() {
            this.state.selectedRows.forEach(rowId => {
                this.$table.find(`tr[data-id="${rowId}"]`).addClass('selected');
            });
        }

        async reload(resetPaging = false) {
            if (!this.state.isInitialized) {
                console.warn('[BaseTable] Table not initialized');
                return;
            }

            try {
                this.state.isLoading = true;
                await this.datatable.ajax.reload(null, resetPaging);
            } catch (error) {
                console.error('[BaseTable] Reload error:', error);
                this.handleError(error);
            } finally {
                this.state.isLoading = false;
            }
        }

        refresh() {
            this.state.selectedRows.clear();
            return this.reload(true);
        }

        destroy() {
            try {
                this.cleanupEvents();
                
                if (this.datatable) {
                    this.datatable.destroy();
                    this.datatable = null;
                }

                this.state = null;
                this.options = null;

                console.log(`[BaseTable] Table ${this.tableId} destroyed successfully`);
            } catch (error) {
                console.error('[BaseTable] Destroy error:', error);
            }
        }

        cleanupEvents() {
            this.$table.off('.baseTable');
            
            if (this.datatable) {
                this.datatable.off('page.dt');
            }

            this.$table.closest('.dataTables_wrapper')
                .find('.dataTables_filter input')
                .off('.baseTable');
        }

        handleError(error) {
            console.error('[BaseTable] Error:', error);
            irToast.error('Terjadi kesalahan saat memproses data tabel');
        }

        // Utility method untuk debounce
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Lifecycle hooks yang bisa di-override
        onSelectionChange(selectedIds) {}
        onBeforeDraw(settings) {}
        onAfterDraw(settings) {}
        onInitComplete(settings, json) {}
    }

    // Export BaseTable
    window.irBaseTable = BaseTable;

})(jQuery);