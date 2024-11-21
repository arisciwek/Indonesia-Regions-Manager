/**
 * File: assets/js/admin/features/province/index.js  
 * Version: 1.2.1
 * Terakhir Diperbarui: 2024-11-20 03:42:10
 * Deskripsi: Province Manager dengan fitur pemuatan data terpusat dan pengelolaan state
 * 
 * Changelog:
 * v1.2.1 - 2024-11-20 15:65:00 WIB
 * - Fix: Source handling untuk link click di tabel
 * - Add: Event handler untuk province-link click
 * - Fix: Double loading issue pada hash change
 * - Add: Source tracking yang lebih akurat
 * - Improve: Event handling untuk navigasi
 * 
 * v1.2.0 - 2024-11-19
 * - Refactor: Pemisahan validasi berdasarkan sumber ID
 * - Add: Pengecekan eksistensi provinsi untuk direct access
 * - Add: Source-specific data loading strategy
 * - Add: State tracking yang lebih detail
 * - Fix: Data loading setelah update
 * - Fix: Cache management untuk update case
 */

(function($) {
    'use strict';

    class ProvinceManager {
        constructor() {
            this.state = {
                currentId: null,
                isLoading: false,
                lastUpdated: null,
                dataSource: null,
                loadingSource: null,
                hashChangeBlocked: false
            };

            // Initialize components
            this.create = new irProvinceCreate();
            this.update = new irProvinceUpdate();
            this.delete = new irProvinceDelete();
            this.table = new irProvinceTable();
            this.detail = new irProvinceDetail();

            this.initializeCallbacks();
            this.initializeEvents();

            console.log('ProvinceManager: Initialized');
        }

        /**
         * Centralized data loading dengan source-specific handling
         */
        async loadAndDisplayProvince(id, source = 'direct') {
            if (this.state.isLoading) {
                console.log('ProvinceManager: Already loading, skipping');
                return;
            }

            try {
                this.state.isLoading = true;
                this.state.loadingSource = source;
                console.log(`ProvinceManager: Loading province ${id} from ${source}`);

                // Source-specific validation
                if (!await this.validateProvinceId(id, source)) {
                    throw new Error('Invalid province ID');
                }

                // Determine loading strategy based on source
                let data;
                switch (source) {
                    case 'table':
                        // Try cache first for table navigation
                        data = irCache.get('provinces', id);
                        if (!data) {
                            data = await this.loadFromServer(id);
                            irCache.set('provinces', id, data);
                        }
                        break;
                    
                    case 'update':
                        // Always load fresh data after update
                        data = await this.loadFromServer(id);
                        irCache.set('provinces', id, data);
                        break;
                    
                    case 'create':
                        // New data, must load from server
                        data = await this.loadFromServer(id);
                        irCache.set('provinces', id, data);
                        break;
                    
                    default:
                        // Direct URL access - validate first
                        data = await this.loadFromServer(id);
                        irCache.set('provinces', id, data);
                }

                if (!data) {
                    throw new Error('Province not found');
                }

                // Update state and cache
                this.state.currentId = id;
                this.state.dataSource = source;
                this.state.lastUpdated = new Date();

                // Update UI
                await this.updateUI(id, data);

                console.log(`ProvinceManager: Successfully loaded province ${id}`);

            } catch (error) {
                this.handleError(error, id, source);
            } finally {
                this.state.isLoading = false;
                this.state.loadingSource = null;
            }
        }

        /**
         * Validate ID based on source
         */
        async validateProvinceId(id, source) {
            // Basic validation
            if (!id || isNaN(id)) {
                console.error('ProvinceManager: Invalid ID format');
                return false;
            }

            switch (source) {
                case 'table':
                    // ID from table is pre-validated
                    return true;

                case 'create':
                    // New ID from server is always valid
                    return true;

                case 'update':
                    // Current edit ID is valid
                    return id === this.state.currentId;

                case 'direct':
                    // Need to verify existence
                    return await this.validateProvinceExists(id);

                default:
                    console.error('ProvinceManager: Unknown source', source);
                    return false;
            }
        }

        /**
         * Check if province exists for direct access
         */
        async validateProvinceExists(id) {
            try {
                const response = await irAPI.province.get(id);
                return response.success;
            } catch (error) {
                console.error('ProvinceManager: Validation error', error);
                return false;
            }
        }

        /**
         * Load fresh data from server
         */
        async loadFromServer(id) {
            console.log(`ProvinceManager: Loading province ${id} from server`);
            const response = await irAPI.province.get(id);
            
            if (!response.success) {
                throw new Error(response.data?.message || 'Failed to load province data');
            }
            
            return response.data;
        }

        /**
         * Update UI components with new data
         */
        async updateUI(id, data) {
            // Update detail panel
            await this.detail.displayData(data);
            
            // Highlight row in table
            this.table.highlightRow(id);
            
            // Update URL if needed
            if (this.state.loadingSource === 'table') {
                this.updateHash(id);
            }
        }

        /**
         * Update URL hash without triggering hashchange
         */
        updateHash(id) {
            this.state.hashChangeBlocked = true;
            irHelper.setHashId(id);
            setTimeout(() => {
                this.state.hashChangeBlocked = false;
            }, 100);
        }

        /**
         * Initialize component callbacks
         */
        initializeCallbacks() {
            console.log('ProvinceManager: Setting up callbacks');

            // Create callbacks
            this.create.onSuccess = async (data) => {
                console.log('ProvinceManager: Create success callback');
                await this.handleCreateSuccess(data);
            };

            // Update callbacks
            this.update.onSuccess = async (id) => {
                console.log('ProvinceManager: Update success callback');
                await this.handleUpdateSuccess(id);
            };

            // Delete callbacks
            this.delete.onSuccess = async (id) => {
                console.log('ProvinceManager: Delete success callback');
                await this.handleDeleteSuccess(id);
            };

            // Table callbacks
            this.table.onEdit = (id) => {
                console.log('ProvinceManager: Table edit callback');
                this.update.show(id);
            };
            
            this.table.onDelete = (id) => {
                console.log('ProvinceManager: Table delete callback');
                this.delete.delete(id);
            };

            // Detail callbacks
            this.detail.onEdit = (id) => {
                console.log('ProvinceManager: Detail edit callback');
                this.update.show(id);
            };
            
            this.detail.onDelete = (id) => {
                console.log('ProvinceManager: Detail delete callback');
                this.delete.delete(id);
            };

            console.log('ProvinceManager: Callbacks setup complete');
        }

        /**
         * Initialize events
         */
        initializeEvents() {
            // Add province button
            $('#btnAddProvince').on('click', () => this.create.show());

            // Table link clicks
            $(document).on('click', '.province-link', (e) => {
                e.preventDefault();
                const href = $(e.currentTarget).attr('href');
                if (href) {
                    const id = href.replace('#', '');
                    this.loadAndDisplayProvince(id, 'table');
                }
            });

            // Hash change handler
            $(window).on('hashchange.provinceManager', () => {
                if (this.state.hashChangeBlocked) return;
                
                const id = irHelper.getHashId();
                if (id) {
                    this.loadAndDisplayProvince(id, 'direct');
                } else {
                    this.detail.hide();
                }
            });

            // Initial hash check
            const initialId = irHelper.getHashId();
            if (initialId) {
                this.loadAndDisplayProvince(initialId, 'direct');
            }
        }

        /**
         * Handle successful creation
         */
        async handleCreateSuccess(data) {
            try {
                await this.table.reload();
                await this.loadAndDisplayProvince(data.id, 'create');
            } catch (error) {
                this.handleError(error, data.id, 'create');
            }
        }

        /**
         * Handle successful update
         */
        async handleUpdateSuccess(id) {
            try {
                // Clear cache first
                irCache.remove('provinces', id);
                
                // Reload table
                await this.table.reload();
                
                // Get fresh data before loading detail
                const response = await irAPI.province.get(id);
                if (!response.success) {
                    throw new Error(response.data?.message || 'Failed to load province data');
                }
                
                // Update cache with new data
                irCache.set('provinces', id, response.data);
                
                // Update UI with new data
                await this.updateUI(id, response.data);

            } catch (error) {
                console.error('ProvinceManager: Update refresh error:', error);
                irToast.error('Data berhasil disimpan tetapi gagal memperbarui tampilan');
            }
        }

        /**
         * Handle successful deletion
         */
        async handleDeleteSuccess(id) {
            try {
                await this.table.reload();
                irCache.remove('provinces', id);
                irHelper.setHashId('');
                this.detail.hide();
                this.state.currentId = null;
            } catch (error) {
                this.handleError(error, id, 'delete');
            }
        }

        /**
         * Centralized error handler
         */
        handleError(error, id, source) {
            console.error(`ProvinceManager: Error handling province ${id} from ${source}:`, error);

            // Clear invalid state
            if (source === 'direct') {
                irHelper.setHashId('');
            }

            // Reset loading state
            this.state.isLoading = false;
            this.state.loadingSource = null;

            // Show user-friendly error
            if (error.response) {
                irToast.error(error.response.message || 'Server error');
            } else if (error.network) {
                irToast.error('Network error. Please check your connection.');
            } else {
                irToast.error(error.message || 'An unexpected error occurred');
            }
        }
    }

    // Export ProvinceManager
    window.irProvinceManager = ProvinceManager;

})(jQuery);
