/**
 * File: assets/js/admin/features/cities/city-manager.js
 * Version: 1.0.0
 * Description: Manager untuk koordinasi komponen city (table, create, update, delete)
 * 
 * Changelog:
 * - v1.0.0: Initial release
 *   * Koordinasi antar komponen city
 *   * Event binding untuk operasi CRUD
 *   * Lifecycle management untuk komponen city
 */
(function($) {
    'use strict';

    class CityManager {
        constructor(provinceId) {
            console.log('[CityManager] Initializing with province ID:', provinceId);

            this.provinceId = provinceId;
            this.create = new irCityCreate(provinceId);
            this.update = new irCityUpdate(provinceId);
            this.delete = new irCityDelete(provinceId);
            this.table = new irCityTable(provinceId);

            this.initializeCallbacks();
            this.initializeEvents();

            console.log('[CityManager] Initialization complete');
        }

        initializeCallbacks() {
            console.log('[CityManager] Setting up component callbacks');

            // Create callbacks
            this.create.onSuccess = (data) => {
                console.log('[CityManager] Create success:', data);
                this.table.reload();
            };

            // Update callbacks
            this.update.onSuccess = (id) => {
                console.log('[CityManager] Update success:', id);
                this.table.reload();
            };

            // Delete callbacks
            this.delete.onSuccess = (id) => {
                console.log('[CityManager] Delete success:', id);
                this.table.reload();
            };

            // Table callbacks
            this.table.onEdit = (id) => this.update.show(id);
            this.table.onDelete = (id) => this.delete.delete(id);
        }

        initializeEvents() {
            console.log('[CityManager] Setting up event handlers');

            // Add city button
            $(irConstants.SELECTORS.CITY.ADD_BUTTON).on('click', () => {
                console.log('[CityManager] Add button clicked');
                this.create.show();
            });
        }

        /**
         * Update province ID di semua komponen
         */
        setProvinceId(provinceId) {
            if (this.provinceId !== provinceId) {
                console.log('[CityManager] Updating province ID:', provinceId);
                
                this.provinceId = provinceId;
                this.create.setProvinceId(provinceId);
                this.update.setProvinceId(provinceId);
                this.delete.setProvinceId(provinceId);
                this.table.setProvinceId(provinceId);
            }
        }

        /**
         * Reload table data
         */
        reload() {
            console.log('[CityManager] Reloading data');
            this.table.reload();
        }

        /**
         * Cleanup resources
         */
        destroy() {
            console.log('[CityManager] Destroying manager and components');
            
            try {
                // Remove event handlers
                $(irConstants.SELECTORS.CITY.ADD_BUTTON).off('click');

                // Cleanup components
                this.table.destroy();
                this.create = null;
                this.update = null;
                this.delete = null;
                this.table = null;

                console.log('[CityManager] Cleanup successful');
            } catch (error) {
                console.error('[CityManager] Error during cleanup:', error);
            }
        }
    }

    // Export CityManager
    window.irCityManager = CityManager;

})(jQuery);