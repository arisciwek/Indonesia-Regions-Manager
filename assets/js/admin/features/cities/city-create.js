/**
 * File: assets/js/admin/features/cities/city-create.js
 * Version: 1.0.0
 * Description: Create handler untuk kota/kabupaten
 * 
 * Changelog:
 * - v1.0.0: Initial release
 *   * Implementasi create operation untuk city
 *   * Extends CityForm untuk modal management
 *   * Integrasi dengan city API endpoints
 */

(function($) {
    'use strict';

    class CityCreate extends irCityForm {
        constructor(provinceId) {
            console.log('[CityCreate] Initializing...');
            super(provinceId);
            
            // Debug modal instance
            console.log('[CityCreate] Modal initialized:', {
                modalElement: this.$modal,
                formElement: this.$form,
                submitButton: this.$submitButton
            });

            // Bind submit button langsung ke form
            this.$submitButton.off('click').on('click', (e) => {
                console.log('[CityCreate] Submit button clicked');
                e.preventDefault();
                this.$form.submit();
            });

            // Bind form submit event
            this.$form.off('submit').on('submit', async (e) => {
                console.log('[CityCreate] Form submitted');
                e.preventDefault();
                if (!this.isSubmitting) {
                    const formData = new FormData(e.target);
                    console.log('[CityCreate] Form data:', Array.from(formData.entries()));
                    await this.handleSave(formData);
                }
            });
        }

        /**
         * Show modal untuk create operation
         */
        show() {
            console.log('[CityCreate] Show modal triggered');
            
            this.resetForm();
            this.setMode('create');
            this.setTitle('Tambah Kabupaten/Kota');
            
            // Debug form state before show
            console.log('[CityCreate] Form state before show:', {
                form: this.$form.serialize(),
                mode: this.options.mode,
                provinceId: this.provinceId
            });
            
            this.modal.show();
        }

        /**
         * Handle save operation
         */
        async handleSave(formData) {
            if (this.isSubmitting) return;
            
            try {
                this.isSubmitting = true;
                this.$submitButton.prop('disabled', true);
                
                console.log('[CityCreate] Handling save...', {
                    formData: Array.from(formData.entries())
                });

                // Add province_id ke formData
                formData.append('province_id', this.provinceId);

                // Send request
                const response = await irAPI.city.create(formData);
                
                console.log('[CityCreate] Save response:', response);

                if (response.success) {
                    console.log('[CityCreate] Save successful:', response.data);
                    irToast.success(irConstants.MESSAGES.CITY.CREATE_SUCCESS);
                    this.hide();
                    
                    // Clear cache untuk data kota pada provinsi ini
                    irCache.remove(`${irConstants.CACHE_KEYS.CITY}_${this.provinceId}`);
                    
                    // Trigger callback
                    if (typeof this.onSuccess === 'function') {
                        console.log('[CityCreate] Calling onSuccess callback');
                        this.onSuccess(response.data);
                    }
                } else {
                    this.handleError(response);
                }

            } catch (error) {
                console.error('[CityCreate] Save error:', error);
                irToast.error(irConstants.MESSAGES.CITY.ERROR_SAVING);
            } finally {
                this.isSubmitting = false;
                this.$submitButton.prop('disabled', false);
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
         * Callback untuk successful creation
         */
        onSuccess(data) {
            // Will be overridden by CityManager
        }
    }

    // Export CityCreate
    window.irCityCreate = CityCreate;

})(jQuery);