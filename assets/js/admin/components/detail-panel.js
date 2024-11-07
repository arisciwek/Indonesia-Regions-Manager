/**
 * File: assets/js/admin/components/detail-panel.js
 * Version: 1.0.1
 * Description: Tab system handler untuk detail panel
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
                tabButtonSelector: '.ir-tab-btn',
                tabContentSelector: '.ir-tab-content',
                activeClass: 'active',
                onLoad: () => {},
                onShow: () => {},
                onHide: () => {},
                onTabChange: () => {},
                ...options
            };

            this.$mainContent = $(this.options.mainContentSelector);
            this.$detailContent = $(this.options.detailContentSelector);
            this.$loading = this.$detailContent.find(this.options.loadingSelector);
            this.$content = this.$detailContent.find(this.options.contentSelector);
            this.currentId = null;

            this.initializeTabs();
            this.initializeEvents();
        }

        initializeTabs() {
            // Simpan referensi ke tombol dan konten tab
            this.$tabButtons = this.$detailContent.find(this.options.tabButtonSelector);
            this.$tabContents = this.$detailContent.find(this.options.tabContentSelector);
            
            // Log untuk debugging
            console.log('DetailPanel: Tabs initialized', {
                buttons: this.$tabButtons.length,
                contents: this.$tabContents.length
            });
        }

        initializeEvents() {
            // Handle window hashchange
            $(window).on('hashchange', () => this.handleHashChange());

            // Handle tab clicks
            this.$tabButtons.on('click', (e) => {
                const $button = $(e.currentTarget);
                const tabId = $button.data('tab');
                this.switchTab(tabId);
                
                // Log untuk debugging
                console.log('DetailPanel: Tab clicked', { tabId });
            });
        }

        switchTab(tabId) {
            // Validasi tab ID
            if (!tabId) {
                console.error('DetailPanel: Invalid tab ID');
                return;
            }

            // Debug info
            console.log('DetailPanel: Switching to tab', { tabId });

            // Update tombol tab
            this.$tabButtons.removeClass(this.options.activeClass);
            this.$tabButtons.filter(`[data-tab="${tabId}"]`).addClass(this.options.activeClass);

            // Update konten tab
            this.$tabContents.removeClass(this.options.activeClass);
            this.$tabContents.filter(`[data-tab="${tabId}"]`).addClass(this.options.activeClass);

            // Trigger callback
            if (typeof this.options.onTabChange === 'function') {
                this.options.onTabChange(tabId);
            }

            // Save active tab ke localStorage
            this.saveActiveTab(tabId);
        }

        saveActiveTab(tabId) {
            if (this.currentId) {
                localStorage.setItem(`ir_active_tab_${this.currentId}`, tabId);
                console.log('DetailPanel: Saved active tab', { provinceId: this.currentId, tabId });
            }
        }

        loadSavedTab() {
            if (this.currentId) {
                const savedTab = localStorage.getItem(`ir_active_tab_${this.currentId}`);
                if (savedTab) {
                    this.switchTab(savedTab);
                    console.log('DetailPanel: Loaded saved tab', { tabId: savedTab });
                } else {
                    // Default ke tab pertama
                    const firstTabId = this.$tabButtons.first().data('tab');
                    this.switchTab(firstTabId);
                }
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
            this.showLoading();
            
            try {
                this.currentId = id;
                await this.options.onLoad(id);
                this.show();
                this.loadSavedTab();
            } catch (error) {
                console.error('DetailPanel: Load error', error);
                irToast.error('Gagal memuat detail');
            } finally {
                this.hideLoading();
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
    }

    // Export DetailPanel
    window.irDetailPanel = DetailPanel;

})(jQuery);