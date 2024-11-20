/**
 * File: assets/js/admin/features/province/update.js
 * Version: 1.3.1
 * Last Updated: 2024-11-20 11:00:00
 * 
 * Changelog v1.3.1:
 * - Fix: Save handling process
 * - Fix: Form submission flow
 * - Add: Better error handling
 * - Add: State cleanup after save
 * - Fix: Modal hiding after successful save
 * - Add: Detailed logging for debugging
 */

(function($) {
    'use strict';

    class ProvinceUpdate {
        constructor() {
            this.state = {
                currentId: null,
                isProcessing: false,
                originalData: null
            };

            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                validator: (form) => this.validateForm(form),
                mode: 'update',
                validationRules: {
                    required: true,
                    minLength: 3,
                    maxLength: 100,
                    pattern: /^[a-zA-Z\s]+$/,
                    messages: {
                        required: 'Nama provinsi tidak boleh kosong',
                        minLength: 'Nama provinsi minimal 3 karakter',
                        maxLength: 'Nama provinsi maksimal 100 karakter',
                        pattern: 'Nama provinsi hanya boleh mengandung huruf dan spasi'
                    }
                }
            });

            this.initializeEvents();
        }

        initializeEvents() {
            // Form submission handler
            this.modal.$form.off('submit').on('submit', async (e) => {
                e.preventDefault();
                console.log('ProvinceUpdate: Form submitted');
                
                if (this.state.isProcessing) {
                    console.log('ProvinceUpdate: Already processing, skipping submission');
                    return;
                }

                const formValid = await this.validateForm(this.modal.$form);
                if (!formValid) {
                    console.log('ProvinceUpdate: Form validation failed');
                    return;
                }

                // Create new FormData and explicitly get values
                const formData = new FormData();
                const name = this.modal.$form.find('#provinceName').val()?.trim();
                
                // Log the actual values being sent
                console.log('ProvinceUpdate: Submitting with values:', {
                    id: this.state.currentId,
                    name: name
                });

                // Manually append values to ensure proper data
                formData.append('name', name);
                formData.append('id', this.state.currentId);
                
                await this.handleSave(formData);
            });

            // Modal close handler
            this.modal.$modal.on('hide.baseModal', () => {
                this.resetState();
            });

            console.log('ProvinceUpdate: Events initialized');
        }

        resetState() {
            console.log('ProvinceUpdate: Resetting state');
            this.state = {
                currentId: null,
                isProcessing: false,
                originalData: null
            };
            this.modal.clearErrors();
        }

        async show(id) {
            if (!id || !this.validateId(id)) {
                console.error('ProvinceUpdate: Invalid ID:', id);
                return;
            }

            try {
                console.log('ProvinceUpdate: Loading data for ID:', id);
                const data = await this.loadProvinceData(id);
                
                if (!data) {
                    throw new Error('Failed to load province data');
                }

                // Update state
                this.state.currentId = id;
                this.state.originalData = data;
                
                // Setup modal
                this.modal.setMode('update');
                this.modal.setTitle('Edit Provinsi');
                this.modal.setFormData({
                    name: data.name
                });

                // Show modal
                this.modal.show();
                
                console.log('ProvinceUpdate: Province data loaded successfully');

            } catch (error) {
                console.error('ProvinceUpdate: Error loading province:', error);
                irToast.error('Gagal memuat data provinsi');
            }
        }

        validateId(id) {
            return Number.isInteger(Number(id)) && id > 0;
        }

        async loadProvinceData(id) {
            try {
                console.log('ProvinceUpdate: Fetching province data');
                const response = await irAPI.province.get(id);
                
                if (!response.success) {
                    throw new Error(response.data?.message || 'Failed to load province data');
                }

                return response.data;

            } catch (error) {
                console.error('ProvinceUpdate: Load data error:', error);
                throw error;
            }
        }

        async validateForm($form) {
            try {
                const name = $form.find('#provinceName').val()?.trim();
                console.log('ProvinceUpdate: Validating name:', name);

                // Basic validation
                if (!name) {
                    this.modal.showError('provinceName', 'Nama provinsi tidak boleh kosong');
                    return false;
                }

                if (name === this.state.originalData?.name) {
                    return true; // Name unchanged, skip duplicate check
                }

                // Check for duplicate name
                const response = await irAPI.province.checkName(name, this.state.currentId);
                if (!response.success) {
                    this.modal.showError('provinceName', 'Nama provinsi sudah digunakan');
                    return false;
                }

                return true;

            } catch (error) {
                console.error('ProvinceUpdate: Validation error:', error);
                this.modal.showError('provinceName', 'Gagal melakukan validasi');
                return false;
            }
        }

        async handleSave(formData) {
            if (this.state.isProcessing || !this.state.currentId) {
                console.warn('ProvinceUpdate: Save prevented - processing or no ID');
                return;
            }
            
            // Double check the form data before proceeding
            const name = formData.get('name');
            if (!name || !name.trim()) {
                console.error('ProvinceUpdate: Empty name detected before save');
                this.modal.showError('provinceName', 'Nama provinsi tidak boleh kosong');
                return;
            }

            this.state.isProcessing = true;
            this.modal.clearErrors();
            
            try {
                console.log('ProvinceUpdate: Saving data for ID:', this.state.currentId);
                console.log('ProvinceUpdate: Form data being sent:', {
                    id: formData.get('id'),
                    name: formData.get('name'),
                    action: 'ir_update_province'
                });

                // Add required fields
                formData.append('action', 'ir_update_province');
                formData.append('nonce', irSettings.nonce);

                const response = await irAPI.province.update(formData);
                console.log('ProvinceUpdate: Save response:', response);
                
                if (response.success) {
                    console.log('ProvinceUpdate: Save successful');
                    irToast.success('Provinsi berhasil diupdate');
                    
                    // Important: Hide modal before triggering success callback
                    this.modal.hide();
                    
                    if (typeof this.onSuccess === 'function') {
                        await this.onSuccess(this.state.currentId);
                    }
                } else {
                    console.error('ProvinceUpdate: Save failed:', response.data);
                    if (response.data?.field) {
                        this.modal.showError(response.data.field, response.data.message);
                    } else {
                        irToast.error(response.data?.message || 'Gagal menyimpan data');
                    }
                }

            } catch (error) {
                console.error('ProvinceUpdate: Save error:', error);
                irToast.error('Terjadi kesalahan sistem');
            } finally {
                this.state.isProcessing = false;
            }
        }

        destroy() {
            console.log('ProvinceUpdate: Destroying instance');
            this.modal?.$form.off('submit');
            this.modal?.$modal.off('hide.baseModal');
            this.modal?.destroy();
            this.state = null;
        }

        // Callback placeholder - akan di-override oleh ProvinceManager
        onSuccess() {
            console.log('ProvinceUpdate: Default success callback - should be overridden');
        }
    }

    // Export ProvinceUpdate
    window.irProvinceUpdate = ProvinceUpdate;

})(jQuery);
