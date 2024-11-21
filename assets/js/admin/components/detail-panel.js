/**
* File: assets/js/admin/components/detail-panel.js
* Version: 1.0.7
* Last Updated: 2024-11-20 11:01:00
* 
* Changes: 
* - Fix: Perbaikan selector loading state ke class '.ir-loading'
* - Fix: Cara akses loading element untuk support selector ganda
* - Maintain: Semua perbaikan sebelumnya 
* - Add: Debug log untuk element loading
*/

(function($) {
   'use strict';

   class DetailPanel {
       constructor(options = {}) {
           this.options = {
               mainContentSelector: '.ir-provinces',
               detailContentSelector: '.ir-provinces-detail', 
               loadingSelector: '.ir-loading', // Menggunakan class selector
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
           // Akses loading element dengan scope detail content
           this.$loading = this.$detailContent.find(this.options.loadingSelector);
           this.$content = this.$detailContent.find(this.options.contentSelector);
           
           // State management
           this.currentId = null;
           this.activeTab = null;
           this.isInitialized = false;
           this.isLoading = false;
           this.tabsInitialized = false;

           // Initialize loading
           this.initLoading();
           
           // Initialize events
           this.initializeEvents();
           
           console.log('[DetailPanel] Initialized with elements:', {
               loading: {
                   found: this.$loading.length > 0,
                   selector: this.options.loadingSelector,
                   element: this.$loading
               },
               content: {
                   found: this.$content.length > 0,
                   selector: this.options.contentSelector,
                   element: this.$content
               }
           });
       }

       initLoading() {
           if(!this.$loading.length) {
               console.warn('[DetailPanel] Loading element not found');
               return;
           }
           
           // Hide both loading & content initially
           this.$loading.hide();
           if(this.$content.length) {
               this.$content.hide(); 
           }
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
           console.log('[DetailPanel] Tabs initialized:', {
               activeTab: this.activeTab,
               tabCount: this.$tabButtons.length
           });

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

       saveActiveTab(tabId) {
           if (this.currentId) {
               try {
                   localStorage.setItem(`ir_active_tab_${this.currentId}`, tabId);
               } catch (error) {
                   console.warn('[DetailPanel] Failed to save tab state:', error);
               }
           }
       }

       loadSavedTab() {
           if (!this.currentId || !this.tabsInitialized) {
               return;
           }

           try {
               const savedTab = localStorage.getItem(`ir_active_tab_${this.currentId}`);
               if (savedTab && this.$tabButtons.filter(`[data-tab="${savedTab}"]`).length) {
                   this.switchTab(savedTab);
               } else {
                   const firstTabId = this.$tabButtons.first().data('tab');
                   this.switchTab(firstTabId);
               }
           } catch (error) {
               const firstTabId = this.$tabButtons.first().data('tab');
               this.switchTab(firstTabId);
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
           if (this.isLoading) {
               console.log('[DetailPanel] Already loading, skipping');
               return;
           }

           console.log('[DetailPanel] Starting load for ID:', id);
           this.isLoading = true;
           this.showLoading();
           
           try {
               this.currentId = id;
               await this.options.onLoad(id);
               
               // Re-initialize tabs after content is loaded
               this.tabsInitialized = false;
               const initialized = this.initializeTabs();
               
               if (initialized) {
                   this.hideLoading();
                   this.show();
                   this.loadSavedTab();
               } else {
                   console.error('[DetailPanel] Failed to initialize tabs after load');
                   throw new Error('Tab initialization failed');
               }
           } catch (error) {
               console.error('[DetailPanel] Load error:', error);
               this.hideLoading();
               irToast.error('Gagal memuat detail');
           } finally {
               this.isLoading = false;
           }
       }

       show() {
           console.log('[DetailPanel] Showing panel');
           this.$detailContent.addClass('active').show();
           this.$content.show();
           this.$loading.hide();
           this.options.onShow();
       }

       hide() {
           console.log('[DetailPanel] Hiding panel');
           this.$detailContent.removeClass('active').hide();
           this.$content.hide();
           this.$loading.hide();
           this.options.onHide();
       }

       showLoading() {
           console.log('[DetailPanel] Showing loading', {
               loadingElement: this.$loading,
               visible: this.$loading.is(':visible')
           });
           if(this.$loading.length) {
               this.$loading.show();
               if(this.$content.length) {
                   this.$content.hide();
               }
           }
       }

       hideLoading() {
           console.log('[DetailPanel] Hiding loading', {
               loadingElement: this.$loading,
               visible: this.$loading.is(':visible')
           });
           if(this.$loading.length) {
               this.$loading.hide();
               if(this.$content.length) {
                   this.$content.show();
               }
           }
       }

       destroy() {            
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

           console.log('[DetailPanel] Destroyed');
       }
   }

   // Export DetailPanel
   window.irDetailPanel = DetailPanel;

})(jQuery);
