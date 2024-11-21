/**
 * File: assets/js/admin/features/province/detail.js
 * Version: 1.3.0
 * Last Updated: 2024-11-20 14:00:00
 * 
 * Changes:
 * - Fokus pada peran sebagai child component untuk tab info
 * - Integrasi dengan DetailPanel parent
 * - Perbaikan state management lokal
 * - Pemisahan concern antara panel dan konten
 * - Optimasi render content
 */

(function($) {
    'use strict';

    class ProvinceDetail {
        constructor() {
            // Initialize panel
            this.panel = new irDetailPanel({
                onLoad: (id) => this.loadDetail(id),
                onShow: () => this.onPanelShow(),
                onHide: () => this.onPanelHide(),
                onTabChange: (tabId) => this.onTabChange(tabId)
            });

            // Local state untuk info tab
            this.state = {
                currentData: null,
                isLoading: false,
                hasError: false
            };

            this.bindEvents();
            console.log('ProvinceDetail: Initialized');
        }

        bindEvents() {
            // Action buttons di tab info
            $('#btnEditProvince').on('click.provinceDetail', () => {
                if (this.state.currentData) {
                    this.onEdit(this.state.currentData.id);
                }
            });

            $('#btnDeleteProvince').on('click.provinceDetail', () => {
                if (this.state.currentData) {
                    this.onDelete(this.state.currentData.id);
                }
            });

            console.log('ProvinceDetail: Events bound');
        }

        async loadDetail(id) {
            if (this.state.isLoading) return;

            try {
                this.state.isLoading = true;
                this.state.hasError = false;

                // Load data
                const response = await irAPI.province.get(id);
                
                if (!response.success) {
                    throw new Error(response.data?.message || 'Failed to load data');
                }

                // Update state
                this.state.currentData = response.data;

                // Update UI
                this.updateBasicInfo(response.data);

            } catch (error) {
                console.error('ProvinceDetail: Load error:', error);
                this.state.hasError = true;
                throw error; // Let panel handle the error
            } finally {
                this.state.isLoading = false;
            }
        }

        updateBasicInfo(data) {
            if (!data) return;

            try {
                // Update panel info elements
                $('#provinceDetailName').text(data.name || '');
                $('#totalCities').text(data.total_cities || 0);
                $('#createdAt').text(irHelper.formatDate(data.created_at));
                $('#updatedAt').text(irHelper.formatDate(data.updated_at));

            } catch (error) {
                console.error('ProvinceDetail: Error updating basic info:', error);
            }
        }

        onPanelShow() {
            // Panel becoming visible
            if (this.state.currentData) {
                this.updateBasicInfo(this.state.currentData);
            }
        }

        onPanelHide() {
            // Panel being hidden
            this.state.currentData = null;
            this.state.hasError = false;
        }

        onTabChange(tabId) {
            // Tab switching - only care about info tab
            if (tabId === 'info' && this.state.currentData) {
                this.updateBasicInfo(this.state.currentData);
            }
        }

        /**
         * Public interface untuk digunakan ProvinceManager
         */
        async displayData(data) {
            try {
                // Let panel handle loading state
                this.state.currentData = data;
                this.state.hasError = false;

                // Update info content
                this.updateBasicInfo(data);

                // Show panel
                this.panel.show();

            } catch (error) {
                console.error('ProvinceDetail: Display error:', error);
                this.state.hasError = true;
                irToast.error('Gagal menampilkan detail provinsi');
            }
        }

        show() {
            this.panel.show();
        }

        hide() {
            this.panel.hide();
            this.state.currentData = null;
            this.state.hasError = false;
        }

        destroy() {
            console.log('ProvinceDetail: Cleaning up...');

            // Cleanup local events
            $('#btnEditProvince').off('.provinceDetail');
            $('#btnDeleteProvince').off('.provinceDetail');

            // Cleanup panel
            if (this.panel) {
                this.panel.destroy();
            }

            // Clear state
            this.state = null;

            console.log('ProvinceDetail: Cleanup complete');
        }

        // Callback placeholders untuk ProvinceManager
        onEdit() {}
        onDelete() {}
    }

    // Export ProvinceDetail
    window.irProvinceDetail = ProvinceDetail;

})(jQuery);
