/**
 * File: assets/js/admin/features/province/update.js
 * Version: 1.2.5
 * Last Updated: 2024-11-20 05:30:00
 * 
 * Changelog v1.2.5:
 * - Fix: Form validation and error message display
 * - Fix: Modal state management
 * - Fix: Form submission handling
 * - Add: Proper form data validation before save
 * - Add: Clear error messages on new submission
 */

(function($) {
    'use strict';

    class ProvinceUpdate {
        constructor() {
            this.state = {
                currentId: null,
                isProcessing: false
            };

            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                validator: (form) => this.validateForm(form),
                mode: 'update'
            });

            this.initializeEvents();
        }

        initializeEvents() {
            this.modal.$form.off('submit').on('submit', async (e) => {
                e.preventDefault();
                console.log('Form submit event triggered');
                console.log('Current state:', this.state);
                console.log('Form data:', {
                    name: this.modal.$form.find('#provinceName').val(),
                    nameLength: this.modal.$form.find('#provinceName').val()?.length,
                    trimmedLength: this.modal.$form.find('#provinceName').val()?.trim().length
                });
                
                if (!this.state.isProcessing && this.state.currentId) {
                    const formData = new FormData(e.target);
                    console.log('FormData entries:', Object.fromEntries(formData));
                    await this.handleSave(formData);
                }
            });

            this.modal.$modal.off('hidden.bs.modal').on('hidden.bs.modal', () => {
                console.log('Modal hidden - resetting state');
                this.state.currentId = null;
                this.state.isProcessing = false;
                this.modal.clearErrors();
            });
        }

        async show(id) {
            if (!id) return;

            try {
                const response = await irAPI.province.get(id);
                if (!response.success) throw new Error('Failed to load data');

                this.state.currentId = id;
                
                this.modal.resetForm();
                this.modal.setTitle('Edit Provinsi');
                this.modal.show();
                
                // Set form data
                this.modal.$form.find('#provinceName').val(response.data.name);
                
            } catch (error) {
                irToast.error('Gagal memuat data provinsi');
            }
        }

        setFormData(data) {
            if (!data) return;

            const form = this.modal.$form[0];
            const nameField = form?.querySelector('#provinceName');

            if (!form || !nameField) return;

            form.reset();
            nameField.value = data.name;
            $(nameField).trigger('change');
        }

        validateId(id) {
            return Number.isInteger(Number(id)) && id > 0;
        }

        async loadProvinceData(id) {
            try {
                const response = await irAPI.province.get(id);
                
                if (!response.success) {
                    throw new Error(response.data?.message || 'Failed to load province data');
                }

                irCache.set('provinces', id, response.data);
                return response.data;

            } catch (error) {
                console.error('ProvinceUpdate: Load data error:', error);
                throw error;
            }
        }

        async validateForm($form) {
            console.log('Validating form...');
            console.log('Form field value:', {
                raw: $form.find('#provinceName').val(),
                trimmed: $form.find('#provinceName').val()?.trim(),
                field: $form.find('#provinceName')[0],
                fieldType: $form.find('#provinceName')[0]?.type,
                hasValue: $form.find('#provinceName')[0]?.hasValue
            });

            const name = $form.find('#provinceName').val()?.trim();
            console.log('Validation check:', {
                name: name,
                isEmpty: !name,
                length: name?.length
            });
            /*    
            if (!name) {
                console.log('Validation failed: Empty name');
                this.modal.showError('provinceName', 'Nama provinsi tidak boleh kosong');
                return false;
            }
            */

            // Check duplicate
            try {
                const response = await irAPI.province.checkName(name, this.state.currentId);
                if (!response.success) {
                    this.modal.showError('provinceName', 'Nama provinsi sudah digunakan');
                    return false;
                }
            } catch {
                return false;
            }

            return true;
        }

        async checkDuplicateName(name) {
            if (this.state.validationTimer) {
                clearTimeout(this.state.validationTimer);
            }

            try {
                const response = await irAPI.province.checkName(name, this.state.currentId);
                return !response.success;
            } catch (error) {
                console.error('ProvinceUpdate: Name check error:', error);
                return true; // Assume duplicate on error for safety
            }
        }

        async handleSave(formData) {
            if (this.state.isProcessing || !this.state.currentId) return;
            
            this.state.isProcessing = true;
            this.modal.clearErrors();
            
            try {
                formData.append('id', this.state.currentId);
                formData.append('action', 'ir_update_province');
                formData.append('nonce', irSettings.nonce);

                const response = await irAPI.province.update(formData);
                
                if (response.success) {
                    irToast.success('Provinsi berhasil diupdate');
                    this.modal.hide();
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(this.state.currentId);
                    }
                } else {
                    if (response.data?.field) {
                        this.modal.showError(response.data.field, response.data.message);
                    } else {
                        irToast.error(response.data?.message || 'Gagal menyimpan data');
                    }
                }

            } catch (error) {
                irToast.error('Terjadi kesalahan sistem');
            } finally {
                this.state.isProcessing = false;
            }
        }

        destroy() {
            this.modal.$form.off('submit');
            this.modal.$modal.off('hidden.bs.modal');
            this.modal?.destroy();
            this.state = null;
        }

        // Callback untuk ProvinceManager
        onSuccess() {}
    }

    window.irProvinceUpdate = ProvinceUpdate;

})(jQuery);