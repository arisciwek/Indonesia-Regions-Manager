/**
 * File: assets/js/admin/components/detail-panel.js
 * Version: 1.0.4
 * Last Updated: 2024-03-17 15:30:00
 * 
 * Changes: Perbaikan loading state dan inisialisasi tab
 */

(function($) {
    'use strict';

    class DetailPanel {
        constructor(options = {}) {
            console.log('[DetailPanel] Initializing with options:', options);

            this.options = {
                mainContentSelector: '.ir-provinces',
                detailContentSelector: '.ir-provinces-detail',
                loadingSelector: '.ir-loading',
                contentSelector: '.ir-content',
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
            this.$loading = this.$detailContent.find(this.options.loadingSelector);
            this.$content = this.$detailContent.find(this.options.contentSelector);
            
            // State management
            this.currentId = null;
            this.activeTab = null;
            this.isInitialized = false;
            this.isLoading = false;
            this.tabsInitialized = false;

            // Initialize events
            this.initializeEvents();

            console.log('[DetailPanel] Initialization complete');
        }

        initializeTabs() {
            console.log('[DetailPanel] Initializing tabs...');
            
            // Refresh DOM references
            this.$tabButtons = this.$detailContent.find(this.options.tabButtonSelector);
            this.$tabContents = this.$detailContent.find(this.options.tabContentSelector);
            
            // Log tab elements found
            console.log('[DetailPanel] Found elements:', {
                buttons: this.$tabButtons.length,
                contents: this.$tabContents.length
            });

            if (this.$tabButtons.length === 0) {
                console.warn('[DetailPanel] No tab buttons found, will retry after content load');
                return false;
            }

            // Debug tab structure
            this.$tabButtons.each((index, element) => {
                const $btn = $(element);
                const tabId = $btn.data('tab');
                const $content = this.$tabContents.filter(`#${tabId}Content`);
                
                console.log('[DetailPanel] Tab mapping:', {
                    index: index,
                    tabId: tabId,
                    hasContent: $content.length > 0,
                    isActive: $btn.hasClass(this.options.activeClass)
                });
            });

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
            console.log('[DetailPanel] Tabs initialized successfully:', {
                activeTab: this.activeTab,
                totalTabs: this.$tabButtons.length
            });

            return true;
        }

        initializeEvents() {
            console.log('[DetailPanel] Setting up event handlers...');

            // Clean up existing events
            $(window).off('hashchange.detailPanel');
            this.$detailContent.off('click.detailPanel');

            // Reinitialize events
            $(window).on('hashchange.detailPanel', () => {
                console.log('[DetailPanel] Hash changed');
                this.handleHashChange();
            });

            this.$detailContent.on('click.detailPanel', this.options.tabButtonSelector, (e) => {
                e.preventDefault();
                const $clickedTab = $(e.currentTarget);
                const tabId = $clickedTab.data('tab');

                console.log('[DetailPanel] Tab clicked:', {
                    tabId: tabId,
                    isLoading: this.isLoading
                });

                if (tabId && !this.isLoading) {
                    this.switchTab(tabId);
                }
            });

            console.log('[DetailPanel] Event handlers configured');
        }

        async switchTab(tabId) {
            console.log('[DetailPanel] Attempting to switch to tab:', tabId);

            // Validasi dasar
            if (!tabId) {
                console.error('[DetailPanel] Invalid tab ID');
                return;
            }

            // Cek apakah tabs sudah diinisialisasi
            if (!this.tabsInitialized) {
                console.log('[DetailPanel] Tabs not initialized, attempting to initialize');
                if (!this.initializeTabs()) {
                    console.error('[DetailPanel] Cannot switch tab, initialization failed');
                    return;
                }
            }

            const $targetButton = this.$tabButtons.filter(`[data-tab="${tabId}"]`);
            const $targetContent = this.$tabContents.filter(`#${tabId}Content`);

            console.log('[DetailPanel] Tab elements found:', {
                tabId: tabId,
                buttonFound: $targetButton.length > 0,
                contentFound: $targetContent.length > 0
            });

            if (!$targetButton.length || !$targetContent.length) {
                console.error('[DetailPanel] Tab not found:', {
                    tabId: tabId,
                    buttonFound: $targetButton.length > 0,
                    contentFound: $targetContent.length > 0
                });
                return;
            }

            // Prevent switching if same tab
            if (this.activeTab === tabId) {
                console.log('[DetailPanel] Tab already active');
                return;
            }

            // Update UI
            this.$tabButtons.removeClass(this.options.activeClass);
            this.$tabContents.removeClass(this.options.activeClass);

            $targetButton.addClass(this.options.activeClass);
            $targetContent.addClass(this.options.activeClass);

            // Update state
            this.activeTab = tabId;
            this.saveActiveTab(tabId);

            // Trigger callback
            if (typeof this.options.onTabChange === 'function') {
                this.options.onTabChange(tabId);
            }
        }

        saveActiveTab(tabId) {
            if (this.currentId) {
                try {
                    localStorage.setItem(`ir_active_tab_${this.currentId}`, tabId);
                    console.log('[DetailPanel] Saved active tab:', {
                        provinceId: this.currentId,
                        tabId: tabId
                    });
                } catch (error) {
                    console.warn('[DetailPanel] Failed to save tab state:', error);
                }
            }
        }

        loadSavedTab() {
            if (!this.currentId || !this.tabsInitialized) {
                console.log('[DetailPanel] Cannot load saved tab:', {
                    hasCurrentId: !!this.currentId,
                    tabsInitialized: this.tabsInitialized
                });
                return;
            }

            try {
                const savedTab = localStorage.getItem(`ir_active_tab_${this.currentId}`);
                console.log('[DetailPanel] Attempting to load saved tab:', savedTab);

                if (savedTab && this.$tabButtons.filter(`[data-tab="${savedTab}"]`).length) {
                    this.switchTab(savedTab);
                } else {
                    const firstTabId = this.$tabButtons.first().data('tab');
                    this.switchTab(firstTabId);
                }
            } catch (error) {
                console.warn('[DetailPanel] Error loading saved tab:', error);
                const firstTabId = this.$tabButtons.first().data('tab');
                this.switchTab(firstTabId);
            }
        }

        async handleHashChange() {
            const id = irHelper.getHashId();
            console.log('[DetailPanel] Hash changed, new ID:', id);

            if (id) {
                await this.load(id);
            } else {
                this.hide();
            }
        }

        async load(id) {
            console.log('[DetailPanel] Loading content for ID:', id);
            
            if (this.isLoading) {
                console.log('[DetailPanel] Already loading, please wait');
                return;
            }

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
                    this.loadSavedTab();
                } else {
                    console.error('[DetailPanel] Failed to initialize tabs after load');
                }
            } catch (error) {
                console.error('[DetailPanel] Load error:', error);
                irToast.error('Gagal memuat detail');
            } finally {
                this.hideLoading();
                this.isLoading = false;
            }
        }

        show() {
            this.$detailContent.addClass('active').show();
            this.$content.show();
            this.options.onShow();
        }

        hide() {
            this.$detailContent.removeClass('active').hide();
            this.$content.hide();
            this.options.onHide();
        }

        showLoading() {
            this.$loading.show();
            this.$content.hide();
        }

        hideLoading() {
            this.$loading.hide();
            this.$content.show();
        }

        destroy() {
            console.log('[DetailPanel] Destroying instance');
            
            // Cleanup events
            $(window).off('hashchange.detailPanel');
            this.$detailContent.off('click.detailPanel');
            
            // Clear state
            this.currentId = null;
            this.activeTab = null;
            this.isInitialized = false;
            this.tabsInitialized = false;
            this.isLoading = false;
            
            // Clear DOM references
            this.$tabButtons = null;
            this.$tabContents = null;
            
            console.log('[DetailPanel] Cleanup complete');
        }
    }

    // Export DetailPanel
    window.irDetailPanel = DetailPanel;

})(jQuery);