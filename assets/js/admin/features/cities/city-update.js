/**
 * File: assets/js/admin/features/cities/city-update.js
 * Version: 1.0.0
 * Description: Update handler untuk kota/kabupaten
 * 
 * Changelog:
 * - v1.0.0: Initial release
 *   * Implementasi update operation untuk city
 *   * Extends CityForm untuk modal management
 *   * Integrasi dengan city API endpoints
 */

(function($) {
    'use strict';

    class CityUpdate extends irCityForm {
        constructor(provinceId) {
            console.log('[CityUpdate] Initializing...');
            super(provinceId);

            this.currentId = null;
            this.currentData = null;

            // Debug modal instance
            console.log('[CityUpdate] Modal initialized:', {
                modalElement: this.$modal,
                formElement: this.$form,
                submitButton: this.$submitButton,
                provinceId: this.provinceId
            });

            // Bind submit button ke form
            this.$submitButton.off('click').on('click', (e) => {
                console.log('[CityUpdate] Submit button clicked');
                e.preventDefault();
                this.$form.submit();
            });

            // Bind form submit event
            this.$form.off('submit').on('submit', async (e) => {
                console.log('[CityUpdate] Form submitted');
                e.preventDefault();
                if (!this.isSubmitting) {
                    const formData = new FormData(e.target);
                    console.log('[CityUpdate] Form data:', Array.from(formData.entries()));
                    await this.handleSave(formData);
                }
            });
        }

        /**
         * Show update modal dengan data yang sudah ada
         */
        async show(id) {
            if (!id) {
                console.error('[CityUpdate] Invalid ID');
                return;
            }

            try {
                this.currentId = id;
                console.log('[CityUpdate] Loading data for ID', id);

                const data = await this.loadCityData(id);
                
                if (!data || !data.name) {
                    console.error('[CityUpdate] Invalid data received', data);
                    irToast.error('Data kota/kabupaten tidak valid');
                    return;
                }

                this.currentData = data;
                console.log('[CityUpdate] Data loaded', data);

                // Update modal state
                this.setMode('update');
                this.setTitle('Edit Kabupaten/Kota');
                
                // Show modal first
                this.modal.show();

                // Wait for modal to be fully shown
                setTimeout(() => {
                    this.setFormData(data);
                }, 100);

            } catch (error) {
                console.error('[CityUpdate] Load error', error);
                irToast.error('Gagal memuat data kota/kabupaten');
            }
        }

        /**
         * Load city data dari server/cache
         */
        async loadCityData(id) {
            try {
                console.log('[CityUpdate] Requesting data for ID', id);

                // Try to get from cache first
                const cacheKey = `${irConstants.CACHE_KEYS.CITY}_${this.provinceId}`;
                let data = irCache.get(cacheKey, id);

                if (!data) {
                    console.log('[CityUpdate] Cache miss, loading from server');
                    const response = await irAPI.city.get(id);

                    if (!response.success) {
                        throw new Error(response.data?.message || 'Failed to load data');
                    }

                    data = response.data;
                    irCache.set(cacheKey, id, data);
                } else {
                    console.log('[CityUpdate] Data loaded from cache');
                }

                return data;

            } catch (error) {
                console.error('[CityUpdate] Load data error', error);
                throw error;
            }
        }

        /**
         * Handle update operation
         */
        async handleSave(formData) {
            if (!this.currentId) {
                console.error('[CityUpdate] No current ID set');
                return;
            }

            try {
                const name = formData.get('name');
                const type = formData.get('type');
                
                console.log('[CityUpdate] Saving data', {
                    id: this.currentId,
                    name: name,
                    type: type,
                    provinceId: this.provinceId
                });

                if (!name || !type) {
                    console.error('[CityUpdate] Required fields missing');
                    if (!name) this.showError('cityName', 'Nama tidak boleh kosong');
                    if (!type) this.showError('cityType', 'Tipe harus dipilih');
                    return;
                }

                formData.append('id', this.currentId);
                formData.append('province_id', this.provinceId);

                const response = await irAPI.city.update(formData);
                
                console.log('[CityUpdate] Save response', response);

                if (response.success) {
                    irToast.success(irConstants.MESSAGES.CITY.UPDATE_SUCCESS);
                    this.modal.hide();
                    
                    // Clear cache
                    const cacheKey = `${irConstants.CACHE_KEYS.CITY}_${this.provinceId}`;
                    irCache.remove(cacheKey, this.currentId);
                    
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(this.currentId);
                    }
                } else {
                    this.handleError(response);
                }

            } catch (error) {
                console.error('[CityUpdate] Save error:', error);
                irToast.error(irConstants.MESSAGES.CITY.ERROR_SAVING);
            }
        }

        /**
         * Handle error responses
         */
        handleError(response) {
            if (response.data?.field) {
                this.showError(response.data.field, response.data.message);
            } else {
                irToast.error(response.data?.message || irConstants.MESSAGES.CITY.ERROR_SAVING);
            }
        }

        /**
         * Update province ID dan clear current data
         */
        setProvinceId(provinceId) {
            if (this.provinceId !== provinceId) {
                console.log('[CityUpdate] Updating province ID:', provinceId);
                this.provinceId = provinceId;
                this.currentId = null;
                this.currentData = null;
            }
        }

        /**
         * Callback untuk successful update
         */
        onSuccess(id) {
            // Will be overridden by CityManager
        }
    }

    // Export CityUpdate
    window.irCityUpdate = CityUpdate;

})(jQuery);