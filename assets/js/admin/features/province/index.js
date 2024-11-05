/**
 * File: assets/js/admin/features/province/index-solusi-3.js
 * Version: 1.0.1
 * Deskripsi: Province Manager untuk koordinasi komponen provinsi
 * 
 * Changelog:
 * - Implementasi lifecycle management yang lebih baik
 * - Penambahan error handling
 * - Perbaikan event management
 * - Singleton pattern implementation
 */

(function($) {
    'use strict';

    // Private variable untuk singleton
    let instance = null;

    class ProvinceManager {
        constructor() {
            // Implementasi singleton
            if (instance) {
                console.warn('ProvinceManager already initialized, returning existing instance');
                return instance;
            }

            // Flag initialization
            this.initialized = false;
            this.components = {};

            // Initialize manager
            this.initialize();

            // Set instance
            instance = this;
            return instance;
        }

        /**
         * Initialize semua komponen dan event handlers
         */
        initialize() {
            if (this.initialized) {
                console.warn('ProvinceManager already initialized');
                return;
            }

            try {
                this.initializeComponents();
                this.initializeCallbacks();
                this.initializeEvents();
                this.initialized = true;
                console.info('ProvinceManager initialized successfully');
            } catch (error) {
                console.error('Failed to initialize ProvinceManager:', error);
                irToast.error('Terjadi kesalahan saat inisialisasi. Silakan muat ulang halaman.');
            }
        }

        /**
         * Initialize semua komponen yang dibutuhkan
         */
        initializeComponents() {
            // Cleanup existing components if any
            this.cleanupComponents();

            try {
                // Initialize components dengan error handling
                this.components = {
                    create: new irProvinceCreate(),
                    update: new irProvinceUpdate(),
                    delete: new irProvinceDelete(),
                    table: new irProvinceTable(),
                    detail: new irProvinceDetail()
                };
            } catch (error) {
                console.error('Component initialization error:', error);
                throw new Error('Failed to initialize components');
            }
        }

        /**
         * Initialize callbacks antar komponen
         */
        initializeCallbacks() {
            const { create, update, delete: deleteComponent, table, detail } = this.components;

            // Create callbacks
            create.onSuccess = (data) => {
                try {
                    table.reload();
                    irHelper.setHashId(data.id);
                } catch (error) {
                    console.error('Create callback error:', error);
                    irToast.error('Gagal memperbarui tampilan');
                }
            };

            // Update callbacks
            update.onSuccess = (id) => {
                try {
                    table.reload();
                    if (detail.currentId === id) {
                        detail.loadDetail(id);
                    }
                } catch (error) {
                    console.error('Update callback error:', error);
                    irToast.error('Gagal memperbarui tampilan');
                }
            };

            // Delete callbacks
            deleteComponent.onSuccess = (id) => {
                try {
                    table.reload();
                    if (detail.currentId === id) {
                        irHelper.setHashId('');
                    }
                } catch (error) {
                    console.error('Delete callback error:', error);
                    irToast.error('Gagal memperbarui tampilan');
                }
            };

            // Table callbacks
            table.onEdit = (id) => {
                try {
                    update.show(id);
                } catch (error) {
                    console.error('Table edit callback error:', error);
                    irToast.error('Gagal menampilkan form edit');
                }
            };
            table.onDelete = (id) => {
                try {
                    deleteComponent.delete(id);
                } catch (error) {
                    console.error('Table delete callback error:', error);
                    irToast.error('Gagal menghapus data');
                }
            };

            // Detail callbacks
            detail.onEdit = (id) => {
                try {
                    update.show(id);
                } catch (error) {
                    console.error('Detail edit callback error:', error);
                    irToast.error('Gagal menampilkan form edit');
                }
            };
            detail.onDelete = (id) => {
                try {
                    deleteComponent.delete(id);
                } catch (error) {
                    console.error('Detail delete callback error:', error);
                    irToast.error('Gagal menghapus data');
                }
            };
        }

        /**
         * Initialize event handlers
         */
        initializeEvents() {
            // Cleanup existing events first
            this.cleanupEvents();

            const $addButton = $('#btnAddProvince');
            if ($addButton.length) {
                $addButton.on('click.provinceManager', () => {
                    try {
                        if (this.components.create && typeof this.components.create.show === 'function') {
                            this.components.create.show();
                        } else {
                            throw new Error('Create component not initialized properly');
                        }
                    } catch (error) {
                        console.error('Add province error:', error);
                        irToast.error('Gagal menampilkan form tambah provinsi');
                    }
                });
            } else {
                console.warn('Add province button not found');
            }

            // Handle hash changes for detail panel
            $(window).on('hashchange.provinceManager', () => {
                try {
                    const id = irHelper.getHashId();
                    if (id && this.components.detail) {
                        this.components.detail.loadDetail(id);
                    }
                } catch (error) {
                    console.error('Hash change handler error:', error);
                }
            });
        }

        /**
         * Cleanup event handlers
         */
        cleanupEvents() {
            $('#btnAddProvince').off('click.provinceManager');
            $(window).off('hashchange.provinceManager');
        }

        /**
         * Cleanup components
         */
        cleanupComponents() {
            if (this.components.table) {
                this.components.table.destroy();
            }
            // Reset components object
            this.components = {};
        }

        /**
         * Destroy manager dan semua komponennya
         */
        destroy() {
            try {
                this.cleanupEvents();
                this.cleanupComponents();
                this.initialized = false;
                instance = null;
                console.info('ProvinceManager cleanup successful');
            } catch (error) {
                console.error('Error during ProvinceManager cleanup:', error);
            }
        }

        /**
         * Get current ProvinceManager instance
         */
        static getInstance() {
            return instance;
        }
    }

    // Export ProvinceManager
    window.irProvinceManager = ProvinceManager;

    // Initialize when document is ready
    $(document).ready(() => {
        // Check if we're on the correct page
        if ($('.ir-provinces').length) {
            try {
                // Cleanup existing instance if any
                if (window.provinceManager && window.provinceManager.destroy) {
                    window.provinceManager.destroy();
                }
                
                // Create new instance
                window.provinceManager = new ProvinceManager();
                
                // Trigger initial hash check
                $(window).trigger('hashchange.provinceManager');
            } catch (error) {
                console.error('Failed to initialize ProvinceManager:', error);
                irToast.error('Terjadi kesalahan saat inisialisasi. Silakan muat ulang halaman.');
            }
        }
    });

})(jQuery);