/**
 * File: assets/js/admin/features/province/detail.js
 * Version: 1.1.0
 * Description: Province detail panel with lazy loading tabs
 * 
 * Changelog v1.1.0:
 * - Added tab-based interface with lazy loading
 * - Implemented proper state management
 * - Added performance optimizations
 * - Added error handling and logging
 * - Added cache management
 * - Added cleanup methods
 */

(function($) {
    'use strict';

    class ProvinceDetail {
        constructor() {
            console.log('[ProvinceDetail] Initializing...');
            
            this.panel = new irDetailPanel({
                onLoad: (id) => this.loadDetail(id)
            });
            
            this.currentId = null;
            this.activeTab = 'info';
            this.loadedTabs = new Set();
            this.citiesTable = null;

            this.initializeEvents();
            console.log('[ProvinceDetail] Initialized');
        }

        initializeEvents() {
            console.log('[ProvinceDetail] Setting up event handlers');

            // Action buttons
            $('#btnEditProvince').on('click', () => this.onEdit(this.currentId));
            $('#btnDeleteProvince').on('click', () => this.onDelete(this.currentId));

            // Tab switching
            $('.ir-detail-tabs').on('click', '.ir-tab', (e) => {
                e.preventDefault();
                const tabId = $(e.currentTarget).data('tab');
                this.switchTab(tabId);
            });

            console.log('[ProvinceDetail] Event handlers configured');
        }

        async loadDetail(id) {
            console.log('[ProvinceDetail] Loading details for ID:', id);
            this.currentId = id;
            this.loadedTabs.clear();
            
            try {
                const data = await this.loadProvinceData(id);
                if (data) {
                    this.updateBasicInfo(data);
                    this.switchTab('info');
                    console.log('[ProvinceDetail] Basic info loaded successfully');
                }
            } catch (error) {
                console.error('[ProvinceDetail] Load detail error:', error);
                irToast.error('Gagal memuat detail provinsi');
                throw error;
            }
        }

        async loadProvinceData(id) {
            console.log('[ProvinceDetail] Fetching province data');
            
            // Check cache first
            let data = irCache.get('provinces', id);
            
            if (!data) {
                console.log('[ProvinceDetail] Cache miss, loading from server');
                const response = await irAPI.province.get(id);
                if (response.success) {
                    data = response.data;
                    irCache.set('provinces', id, data);
                } else {
                    throw new Error(response.data?.message || 'Failed to load province data');
                }
            } else {
                console.log('[ProvinceDetail] Data loaded from cache');
            }

            return data;
        }

        updateBasicInfo(data) {
            console.log('[ProvinceDetail] Updating basic info display');
            
            $('#provinceDetailName').text(data.name);
            $('#totalCities').text(data.total_cities);
            $('#createdAt').text(irHelper.formatDate(data.created_at));
            $('#updatedAt').text(irHelper.formatDate(data.updated_at));
        }

        async switchTab(tabId) {
            console.log('[ProvinceDetail] Switching to tab:', tabId);
            
            if (this.activeTab === tabId) {
                console.log('[ProvinceDetail] Tab already active');
                return;
            }
            
            // Update UI
            $(`.ir-tab[data-tab="${this.activeTab}"]`).removeClass('active');
            $(`.ir-tab[data-tab="${tabId}"]`).addClass('active');
            
            // Hide all content first
            $('.ir-tab-content').hide();
            
            const $targetContent = $(`#${tabId}Content`);
            $targetContent.show();
            
            // Load tab data if not loaded before
            if (!this.loadedTabs.has(tabId)) {
                console.log('[ProvinceDetail] Loading new tab content');
                await this.loadTabContent(tabId);
                this.loadedTabs.add(tabId);
            }
            
            this.activeTab = tabId;
        }

        async loadTabContent(tabId) {
            console.log('[ProvinceDetail] Loading content for tab:', tabId);
            
            try {
                switch(tabId) {
                    case 'cities':
                        await this.loadCitiesTab();
                        break;
                    case 'stats':
                        await this.loadStatsTab();
                        break;
                }
            } catch (error) {
                console.error(`[ProvinceDetail] Failed to load tab ${tabId}:`, error);
                $(`#${tabId}Content`).html(
                    '<div class="ir-tab-error">Failed to load content. Please try again.</div>'
                );
            }
        }

        async loadCitiesTab() {
            console.log('[ProvinceDetail] Loading cities tab');
            
            const $container = $('#citiesContent');
            $container.html('<div class="ir-tab-loading"><div class="spinner"></div></div>');

            try {
                if (!this.citiesTable) {
                    this.citiesTable = new irCitiesTable(this.currentId);
                    console.log('[ProvinceDetail] Cities table initialized');
                } else {
                    this.citiesTable.setProvinceId(this.currentId);
                    this.citiesTable.reload();
                    console.log('[ProvinceDetail] Cities table reloaded');
                }
            } catch (error) {
                console.error('[ProvinceDetail] Failed to load cities:', error);
                $container.html(
                    '<div class="ir-tab-error">Failed to load cities data. Please try again.</div>'
                );
            }
        }

        async loadStatsTab() {
            console.log('[ProvinceDetail] Loading stats tab');
            // Implementation for statistics tab
        }

        destroy() {
            console.log('[ProvinceDetail] Cleaning up');
            
            if (this.citiesTable) {
                this.citiesTable.destroy();
            }
            
            $('.ir-detail-tabs').off('click');
            $('#btnEditProvince').off('click');
            $('#btnDeleteProvince').off('click');
            
            this.loadedTabs.clear();
            this.currentId = null;
            
            console.log('[ProvinceDetail] Cleanup complete');
        }

        // Callback handlers
        onEdit(id) {}
        onDelete(id) {}
    }

    // Export ProvinceDetail
    window.irProvinceDetail = ProvinceDetail;

})(jQuery);