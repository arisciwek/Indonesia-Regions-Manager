/**
 * File: assets/js/admin/features/province/detail.js
 * Version: 1.2.1
 * Terakhir Diperbarui: 2024-11-19 22:11:00
 * Deskripsi: Panel detail provinsi dengan pemisahan logika tampilan dan data
 * 
 * Changelog:
 * v1.2.1 - 2024-11-19
 * - Fix: Menambahkan metode initializeTabs yang hilang
 * - Fix: Validasi tab initialization
 * - Add: Tab state management yang lebih baik
 * - Add: Error handling untuk inisialisasi tab
 * - Add: Safe element access dengan null checking
 * - Update: Improved tab lifecycle management
 */

(function($) {
    'use strict';

    class ProvinceDetail {
        constructor() {
            // State untuk UI
            this.state = {
                activeTab: 'info',
                isVisible: false,
                isInitialized: false,
                loadedTabs: new Set(),
                currentData: null
            };

            this.initializeUI();
            if (this.state.isInitialized) {
                this.bindEvents();
            }
        }

        initializeUI() {
            try {
                // Cache DOM elements
                this.$container = $('.ir-provinces-detail');
                this.$content = this.$container.find('.ir-content');
                this.$loading = this.$container.find('.ir-loading');
                this.$tabs = this.$container.find('.ir-tab');
                this.$tabContents = this.$container.find('.ir-tab-content');

                // Validate required elements
                if (!this.$container.length) {
                    throw new Error('Detail container not found');
                }

                // Initialize tabs
                this.initializeTabs();
                
                this.state.isInitialized = true;
                console.log('ProvinceDetail: UI initialized successfully');
            } catch (error) {
                console.error('ProvinceDetail: UI initialization failed:', error);
                this.state.isInitialized = false;
            }
        }

        initializeTabs() {
            try {
                if (!this.$tabs.length) {
                    console.warn('ProvinceDetail: No tabs found');
                    return;
                }

                // Reset tab state
                this.state.loadedTabs.clear();
                
                // Find active tab or set default
                const $activeTab = this.$tabs.filter('.active');
                if ($activeTab.length) {
                    this.state.activeTab = $activeTab.data('tab');
                } else {
                    // Set first tab as active if none active
                    const $firstTab = this.$tabs.first();
                    $firstTab.addClass('active');
                    this.state.activeTab = $firstTab.data('tab');
                }

                // Show active tab content
                this.showTabContent(this.state.activeTab);

                console.log('ProvinceDetail: Tabs initialized successfully');
            } catch (error) {
                console.error('ProvinceDetail: Tab initialization failed:', error);
            }
        }

        showTabContent(tabId) {
            this.$tabContents.removeClass('active');
            this.$tabContents.filter(`#${tabId}Content`).addClass('active');
        }

        bindEvents() {
            if (!this.state.isInitialized) {
                console.warn('ProvinceDetail: Cannot bind events, not initialized');
                return;
            }

            // Cleanup existing events first
            this.unbindEvents();

            // Tab switching
            if (this.$tabs?.length) {
                this.$tabs.on('click.provinceDetail', (e) => {
                    e.preventDefault();
                    const tabId = $(e.currentTarget).data('tab');
                    if (tabId) {
                        this.switchTab(tabId);
                    }
                });
            }

            // Action buttons
            const $editBtn = $('#btnEditProvince');
            const $deleteBtn = $('#btnDeleteProvince');

            if ($editBtn.length) {
                $editBtn.on('click.provinceDetail', () => {
                    if (this.state.currentData) {
                        this.onEdit(this.state.currentData.id);
                    }
                });
            }

            if ($deleteBtn.length) {
                $deleteBtn.on('click.provinceDetail', () => {
                    if (this.state.currentData) {
                        this.onDelete(this.state.currentData.id);
                    }
                });
            }

            console.log('ProvinceDetail: Events bound successfully');
        }

        unbindEvents() {
            if (this.$tabs?.length) {
                this.$tabs.off('.provinceDetail');
            }
            $('#btnEditProvince').off('.provinceDetail');
            $('#btnDeleteProvince').off('.provinceDetail');
        }

        switchTab(tabId) {
            if (!this.state.isInitialized || this.state.activeTab === tabId) return;

            // Update UI
            this.$tabs.removeClass('active');
            this.$tabs.filter(`[data-tab="${tabId}"]`).addClass('active');
            
            // Update state
            this.state.activeTab = tabId;
            this.showTabContent(tabId);

            // Render tab content if needed
            if (!this.state.loadedTabs.has(tabId)) {
                this.renderTabContent(tabId);
                this.state.loadedTabs.add(tabId);
            }
        }

        renderTabContent(tabId) {
            if (!this.state.currentData) return;

            const $content = $(`#${tabId}Content`);
            if (!$content.length) return;

            switch(tabId) {
                case 'cities':
                    this.renderCitiesTab($content);
                    break;
                case 'stats':
                    this.renderStatsTab($content);
                    break;
                // Info tab doesn't need special rendering
            }
        }

        renderCitiesTab($container) {
            if (!this.citiesTable) {
                this.citiesTable = new irCitiesTable(this.state.currentData.id);
            } else {
                this.citiesTable.setProvinceId(this.state.currentData.id);
                this.citiesTable.reload();
            }
        }

        renderStatsTab($container) {
            const stats = this.prepareStats();
            $container.html(this.getStatsTemplate(stats));
        }

        prepareStats() {
            const data = this.state.currentData;
            return {
                totalCities: data.total_cities || 0,
                lastUpdated: data.updated_at,
                // ... statistik lainnya
            };
        }

        getStatsTemplate(stats) {
            return `
                <div class="ir-detail-stats">
                    <div class="ir-stat-card">
                        <div class="stat-icon">
                            <span class="dashicons dashicons-location"></span>
                        </div>
                        <div class="stat-content">
                            <h3>Total Kota/Kabupaten</h3>
                            <span class="stat-value">${stats.totalCities}</span>
                        </div>
                    </div>
                    <div class="ir-stat-card">
                        <div class="stat-icon">
                            <span class="dashicons dashicons-calendar"></span>
                        </div>
                        <div class="stat-content">
                            <h3>Terakhir Diupdate</h3>
                            <span class="stat-value">${irHelper.formatDate(stats.lastUpdated)}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        displayData(data) {
            if (!this.state.isInitialized) {
                console.warn('ProvinceDetail: Cannot display data, not initialized');
                return;
            }

            this.state.currentData = data;
            
            // Update basic info
            this.updateBasicInfo(data);
            
            // Show panel
            this.show();
            
            // Reset dan load tab default
            this.state.loadedTabs.clear();
            this.switchTab('info');
        }

        updateBasicInfo(data) {
            $('#provinceDetailName').text(data.name || '');
            $('#totalCities').text(data.total_cities || 0);
            $('#createdAt').text(irHelper.formatDate(data.created_at));
            $('#updatedAt').text(irHelper.formatDate(data.updated_at));
        }

        show() {
            this.$container?.addClass('active').show();
            this.state.isVisible = true;
        }

        hide() {
            this.$container?.removeClass('active').hide();
            this.state.isVisible = false;
            this.state.currentData = null;
            this.state.loadedTabs.clear();
        }

        destroy() {
            if (this.citiesTable) {
                this.citiesTable.destroy();
                this.citiesTable = null;
            }
            
            this.unbindEvents();
            this.state = null;
        }

        // Callback placeholders yang akan di-override oleh ProvinceManager
        onEdit() {}
        onDelete() {}
    }

    // Export ProvinceDetail
    window.irProvinceDetail = ProvinceDetail;

})(jQuery);

