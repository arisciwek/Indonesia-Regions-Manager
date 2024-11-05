/**
 * File: assets/js/admin/features/province/create.js
 * Version: 1.0.0
 * Revisi-1
 * 
 * Changelog:
 * - Fix double submission issue
 * - Fix form data handling
 * - Add proper error handling
 * - Add debugging logs
 * - Ensure proper modal closure after success
 * 
 * Dependencies:
 * - jQuery
 * - irFormModal
 * - irValidator
 * - irToast
 */

(function($) {
    'use strict';

    class ProvinceCreate {
        constructor() {
            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                validator: (form) => this.validateForm(form)
            });

            this.validator = irValidator;
        }

        show() {
            // Reset form state before showing
            this.modal.resetForm();
            this.modal.setTitle('Tambah Provinsi');
            this.modal.show();
        }

        async validateForm($form) {
            const name = $form.find('#provinceName').val().trim();
            
            // Basic validation
            const result = this.validator.validateField('name', name);
            if (!result.valid) {
                this.modal.showError('provinceName', result.message);
                return false;
            }

            // Check duplicate if name is valid
            if (name.length >= 3) {
                const dupeCheck = await this.validator.checkDuplicate(name, 'ir_check_province_name');
                if (!dupeCheck.valid) {
                    this.modal.showError('provinceName', dupeCheck.message);
                    return false;
                }
            }

            return true;
        }

        async handleSave(formData) {
            try {
                // Debug log untuk tracking
                console.log('Starting province creation...');
                
                // Ensure we're sending the right action
                const data = {
                    action: 'ir_create_province',
                    name: formData.get('name'),
                    nonce: irSettings.nonce
                };

                console.log('Sending data:', data);

                const response = await $.ajax({
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: data,
                    dataType: 'json'
                });

                console.log('Server response:', response);
                
                if (response.success) {
                    irToast.success('Provinsi berhasil ditambahkan');
                    this.modal.hide();
                    
                    // Update cache dan table
                    irCache.remove('provinces');
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(response.data);
                    }
                } else {
                    const errorMessage = response.data?.message || 'Gagal menyimpan data';
                    if (response.data?.field) {
                        this.modal.showError(response.data.field, errorMessage);
                    } else {
                        irToast.error(errorMessage);
                    }
                }
            } catch (error) {
                console.error('Save error:', error);
                if (error.responseJSON) {
                    console.error('Server error details:', error.responseJSON);
                }
                irToast.error('Terjadi kesalahan sistem');
            }
        }

        onSuccess(data) {
            // Will be overridden in ProvinceManager
        }
    }

    // Export ProvinceCreate
    window.irProvinceCreate = ProvinceCreate;

})(jQuery);