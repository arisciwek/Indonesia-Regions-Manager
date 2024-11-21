/**
 * File: assets/js/admin/features/province/index.js  
 * Version: 1.2.2
 * Terakhir Diperbarui: 2024-11-20 15:46:15
 * 
 * Changelog:
 * v1.2.2 - 2024-11-20 15:45:00 WIB
 * - Add: Sinkronisasi loading state dengan DetailPanel
 * - Fix: Race condition saat multiple data load requests
 * - Add: Loading state check sebelum operasi data
 * - Fix: Timing untuk update UI setelah data load
 * - Fix: Edge case saat navigasi selama loading
 * 
 * Note: Perubahan minimal yang fokus pada sinkronisasi loading state
 * tanpa mengubah alur kerja dasar yang sudah ada
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
                hashChangeBlocked: false,
                pendingLoadRequest: null,
                isCancelled: false
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
         * Centralized data loading dengan pengecekan loading state
         */
        async loadAndDisplayProvince(id, source = 'direct') {
            // Check if we should cancel current loading
            if (this.state.isLoading) {
                if (this.state.loadingSource === 'direct' && source !== 'direct') {
                    console.log('ProvinceManager: Deferring load request during direct load');
                    this.state.pendingLoadRequest = { id, source };
                    return;
                }
                
                // Cancel current loading if new request is more important
                if (this.shouldCancelCurrentLoading(source)) {
                    this.state.isCancelled = true;
                    console.log('ProvinceManager: Cancelling current load for new request');
                }
                
                // Wait for current loading to finish
                await this.waitForLoadingComplete();
            }

            try {
                this.state.isLoading = true;
                this.state.loadingSource = source;
                this.state.isCancelled = false;
                console.log(`ProvinceManager: Loading province ${id} from ${source}`);

                // Source-specific validation
                if (!await this.validateProvinceId(id, source)) {
                    throw new Error('Invalid province ID');
                }

                // Check cancellation before proceeding
                if (this.state.isCancelled) {
                    console.log('ProvinceManager: Load cancelled');
                    return;
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

                // Final cancellation check before UI update
                if (this.state.isCancelled) {
                    console.log('ProvinceManager: Load cancelled before UI update');
                    return;
                }

                // Update state and cache
                this.state.currentId = id;
                this.state.dataSource = source;
                this.state.lastUpdated = new Date();

                // Update UI
                await this.updateUI(id, data);

                console.log(`ProvinceManager: Successfully loaded province ${id}`);

            } catch (error) {
                if (!this.state.isCancelled) {
                    this.handleError(error, id, source);
                }
            } finally {
                this.state.isLoading = false;
                this.state.loadingSource = null;

                // Process any pending requests
                if (this.state.pendingLoadRequest) {
                    const { id, source } = this.state.pendingLoadRequest;
                    this.state.pendingLoadRequest = null;
                    await this.loadAndDisplayProvince(id, source);
                }
            }
        }

        /**
         * Check if current loading should be cancelled for new request
         */
        shouldCancelCurrentLoading(newSource) {
            const currentSource = this.state.loadingSource;
            
            // Direct load takes precedence
            if (newSource === 'direct') return true;
            
            // Create/Update take precedence over table navigation
            if ((newSource === 'create' || newSource === 'update') && 
                currentSource === 'table') return true;
            
            return false;
        }

        /**
         * Wait for current loading to complete
         */
        async waitForLoadingComplete() {
            return new Promise(resolve => {
                const checkLoading = () => {
                    if (!this.state.isLoading) {
                        resolve();
                    } else {
                        setTimeout(checkLoading, 100);
                    }
                };
                checkLoading();
            });
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
            // Check loading state before updating UI
            if (this.state.isCancelled) return;

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
                
                // Get fresh data
                await this.loadAndDisplayProvince(id, 'update');

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

            // Show user-friendly error
            if (error.response) {
                irToast.error(error.response.message || 'Server error');
            } else if (error.network) {
                irToast.error('Network error. Please check your connection.');
            } else {
                irToast.error(error.message || 'An unexpected error occurred');
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
                    // Untuk update, ID apapun valid karena sudah divalidasi oleh form
                    return true;

                case 'direct':
                    // Need to verify existence
                    return await this.validateProvinceExists(id);

                default:
                    console.error('ProvinceManager: Unknown source', source);
                    return false;
            }
        }

        /**
         * Handle successful update dengan flow yang benar
         */
        async handleUpdateSuccess(id) {
            try {
                console.log('ProvinceManager: Handling update success for ID:', id);
                
                // Clear cache untuk ID yang diupdate
                irCache.remove('provinces', id);
                
                // Reload table data
                await this.table.reload();

                // Update URL dan load detail terbaru
                irHelper.setHashId(id);
                this.state.currentId = id; // Update currentId ke ID yang baru diupdate
                
                // Load dan tampilkan data terbaru
                await this.loadAndDisplayProvince(id, 'update');

            } catch (error) {
                console.error('ProvinceManager: Update refresh error:', error);
                irToast.error('Data berhasil disimpan tetapi gagal memperbarui tampilan');
            }
        }
    }

    // Export ProvinceManager
    window.irProvinceManager = ProvinceManager;

})(jQuery);
