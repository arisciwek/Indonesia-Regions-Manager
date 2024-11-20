/**
 * File: assets/js/admin/components/detail-panel.js
 * Version: 1.0.5
 * Last Updated: 2024-11-20 00:02:20
 * 
 * Changes: 
 * - Add proper loading UI with spinner
 * - Fix loading state transitions
 * - Add loading visibility control
 * - Improve content visibility control
 * - Add utility methods for loading state
 */

(function($) {
    'use strict';

    class DetailPanel {
        constructor(options = {}) {
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

                // Update DOM elements references
                this.$mainContent = $(this.options.mainContentSelector);
                this.$detailContent = $(this.options.detailContentSelector);
                this.$loading = this.$detailContent.find(this.options.loadingSelector);
                this.$content = this.$detailContent.find(this.options.contentSelector);
                
                // Initialize panel state
                this.hideLoading();
                this.$content.show();

                this.$loading = this.$detailContent.find('#provinceDetailLoading');
                this.$content = this.$detailContent.find('#provinceDetail');
                this.hideLoading();
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

            // Initialize loading UI
            this.initializeLoadingUI();
            
            // Initialize events
            this.initializeEvents();
        }

        initializeLoadingUI() {
            // Remove existing text content
            this.$loading.empty();
            
            // Add spinner HTML
            this.$loading.html(`
                <div class="ir-spinner-container">
                    <div class="ir-spinner"></div>
                </div>
            `);

            // Hide loading by default
            this.$loading.hide();
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
            this.saveActiveTab(tabId);

            // Trigger callback
            if (typeof this.options.onTabChange === 'function') {
                this.options.onTabChange(tabId);
            }
        }

        async load(id) {
            if (this.isLoading) return;

            this.isLoading = true;
            this.showLoading();
            
            try {
                this.currentId = id;
                await this.options.onLoad(id);
                
                this.tabsInitialized = false;
                const initialized = this.initializeTabs();
                
                if (initialized) {
                    this.hideLoading();
                    this.show();
                    this.loadSavedTab();
                } else {
                    throw new Error('Failed to initialize tabs');
                }
            } catch (error) {
                this.hideLoading();
                irToast.error('Gagal memuat detail');
            } finally {
                this.isLoading = false;
            }
        }

        show() {
            this.hideLoading();
            this.$detailContent.addClass('active').show();
            this.$content.show();
            this.options.onShow();
        }

        hide() {
            this.hideLoading();
            this.$detailContent.removeClass('active').hide();
            this.$content.hide();
            this.options.onHide();
        }

        showLoading() {
            if (this.$content) {
                this.$content.hide();
            }
            if (this.$loading) {
                this.$loading.show();
            }
        }

        hideLoading() {
            if (this.$loading) {
                this.$loading.hide();
            }
            if (this.$content) {
                this.$content.show();
            }
        }

        // Add CSS for spinner
        static injectStyles() {
            const styles = `
                .ir-spinner-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 200px;
                }
                .ir-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #2271b1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            
            const styleElement = document.createElement('style');
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }

        // Rest of the methods remain unchanged...
    }

    // Inject spinner styles when script loads
    DetailPanel.injectStyles();

    // Export DetailPanel
    window.irDetailPanel = DetailPanel;

})(jQuery);
