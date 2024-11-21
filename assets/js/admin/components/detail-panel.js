/**
 * File: assets/js/admin/components/detail-panel.js
 * Version: 1.0.6
 * Last Updated: 2024-11-20 13:31:12
 * 
 * Changes: 
 * - Fokus pada peran sebagai parent panel
 * - Perbaikan loading state management
 * - Perbaikan tab system
 * - Perbaikan event handling
 * - Memperjelas interface untuk child tabs
 */

(function($) {
    'use strict';

    class DetailPanel {
        constructor(options = {}) {
            this.options = {
                mainContentSelector: '.ir-provinces',
                detailContentSelector: '.ir-provinces-detail',
                loadingSelector: '#provinceDetailLoading',
                contentSelector: '#provinceDetail',
                tabButtonSelector: '.ir-tab',
                tabContentSelector: '.ir-tab-content',
                activeClass: 'active',
                onLoad: () => {},
                onShow: () => {},
                onHide: () => {},
                onTabChange: () => {},
                ...options
            };

            // Cache DOM elements
            this.$mainContent = $(this.options.mainContentSelector);
            this.$detailContent = $(this.options.detailContentSelector);
            this.$loading = $(this.options.loadingSelector);
            this.$content = $(this.options.contentSelector);
            
            // State management
            this.currentId = null;
            this.activeTab = null;
            this.isInitialized = false;
            this.isLoading = false;
            this.tabsInitialized = false;

            // Initialize panel
            this.validateStructure();
            this.initializeEvents();
        }

        validateStructure() {
            if (!this.$detailContent.length) {
                console.error('[DetailPanel] Detail container not found');
                return false;
            }

            if (!this.$loading.length) {
                console.error('[DetailPanel] Loading element not found');
                return false;
            }

            return true;
        }

        initializeTabs() {
            // Refresh DOM references
            this.$tabButtons = this.$detailContent.find(this.options.tabButtonSelector);
            this.$tabContents = this.$detailContent.find(this.options.tabContentSelector);
            
            if (this.$tabButtons.length === 0) {
                console.warn('[DetailPanel] No tab buttons found, will retry after content load');
                return false;
            }

            // Set active tab
            const $activeTab = this.$tabButtons.filter(`.${this.options.activeClass}`);
            if ($activeTab.length) {
                this.activeTab = $activeTab.first().data('tab');
            } else {
                const $firstTab = this.$tabButtons.first();
                $firstTab.addClass(this.options.activeClass);
                this.activeTab = $firstTab.data('tab');
            }

            this.tabsInitialized = true;
            return true;
        }

        initializeEvents() {
            // Clean up existing events
            $(window).off('hashchange.detailPanel');
            this.$detailContent.off('click.detailPanel');

            // Reinitialize events
            $(window).on('hashchange.detailPanel', () => {
                this.handleHashChange();
            });

            this.$detailContent.on('click.detailPanel', this.options.tabButtonSelector, (e) => {
                e.preventDefault();
                const $clickedTab = $(e.currentTarget);
                const tabId = $clickedTab.data('tab');
                if (tabId && !this.isLoading) {
                    this.switchTab(tabId);
                }
            });
        }

        async switchTab(tabId) {
            // Validasi dasar
            if (!tabId) return;

            // Cek apakah tabs sudah diinisialisasi
            if (!this.tabsInitialized) {
                if (!this.initializeTabs()) return;
            }

            const $targetButton = this.$tabButtons.filter(`[data-tab="${tabId}"]`);
            const $targetContent = this.$tabContents.filter(`#${tabId}Content`);

            if (!$targetButton.length || !$targetContent.length) {
                console.error('[DetailPanel] Tab not found:', {
                    tabId: tabId,
                    buttonFound: $targetButton.length > 0,
                    contentFound: $targetContent.length > 0
                });
                return;
            }

            // Prevent switching if same tab
            if (this.activeTab === tabId) return;

            // Update UI
            this.$tabButtons.removeClass(this.options.activeClass);
            this.$tabContents.removeClass(this.options.activeClass);

            $targetButton.addClass(this.options.activeClass);
            $targetContent.addClass(this.options.activeClass);

            // Update state
            this.activeTab = tabId;

            // Trigger callback
            if (typeof this.options.onTabChange === 'function') {
                this.options.onTabChange(tabId);
            }
        }

        async handleHashChange() {
            const id = irHelper.getHashId();
            if (id) {
                await this.load(id);
            } else {
                this.hide();
            }
        }

        async load(id) {
            if (this.isLoading) return;

            this.isLoading = true;
            this.showLoading();
            
            try {
                this.currentId = id;
                await this.options.onLoad(id);
                
                // Re-initialize tabs after content is loaded
                this.tabsInitialized = false;
                const initialized = this.initializeTabs();
                
                if (initialized) {
                    this.show();
                    // Let child handle its own initialization
                } else {
                    console.error('[DetailPanel] Failed to initialize tabs');
                }
            } catch (error) {
                console.error('[DetailPanel] Load error:', error);
                irToast.error('Gagal memuat detail');
            } finally {
                this.hideLoading();
                this.isLoading = false;
            }
        }

        showLoading() {
            this.$content.hide();
            this.$loading.fadeIn(200);
        }

        hideLoading() {
            this.$loading.fadeOut(200, () => {
                if (!this.isLoading) {
                    this.$content.fadeIn(200);
                }
            });
        }

        show() {
            this.$detailContent.addClass(this.options.activeClass).show();
            this.$content.show();
            this.options.onShow();
        }

        hide() {
            this.$detailContent.removeClass(this.options.activeClass).hide();
            this.$content.hide();
            this.$loading.hide();
            this.options.onHide();
        }

        destroy() {
            // Clean up events
            $(window).off('hashchange.detailPanel');
            this.$detailContent.off('click.detailPanel');
            
            // Reset state
            this.currentId = null;
            this.activeTab = null;
            this.isInitialized = false;
            this.tabsInitialized = false;
            this.isLoading = false;
            
            // Hide elements
            this.$loading.hide();
            this.$content.hide();
            this.$detailContent.hide();
            
            // Clear DOM references
            this.$tabButtons = null;
            this.$tabContents = null;
        }
    }

    // Export DetailPanel
    window.irDetailPanel = DetailPanel;

})(jQuery);
