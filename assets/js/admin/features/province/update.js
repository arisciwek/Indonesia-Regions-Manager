// File: assets/js/admin/features/province/update.js
// Version: 1.0.0
// Revisi-1
// 
// Changelog:
// - Fix form event handling
// - Add validation for update only
// - Prevent handling when id is empty
// - Fix update specific logic
// 
// Dependencies:
// - jQuery
// - irFormModal
// - irValidator
// - irToast


(function($) {
    'use strict';

    class ProvinceUpdate {
        constructor() {
            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                validator: (form) => this.validateForm(form)
            });

            this.validator = irValidator;
            this.currentId = null;
        }

        async show(id) {
            if (!id) {
                console.warn('Update called without ID');
                return;
            }

            try {
                this.currentId = id;
                this.modal.setTitle('Edit Provinsi');

                const response = await $.ajax({
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'ir_get_province',
                        id: id,
                        nonce: irSettings.nonce
                    }
                });

                if (response.success) {
                    this.modal.setFormData({
                        id: id,
                        name: response.data.name
                    });
                    this.modal.show();
                } else {
                    irToast.error(response.data.message || 'Gagal memuat data provinsi');
                }
            } catch (error) {
                console.error('Load error:', error);
                irToast.error('Gagal memuat data provinsi');
            }
        }

        async validateForm($form) {
            // Only proceed if we have an ID
            if (!this.currentId) {
                console.warn('Validation called without ID');
                return false;
            }

            const name = $form.find('#provinceName').val().trim();
            
            // Basic validation
            const result = this.validator.validateField('name', name);
            if (!result.valid) {
                this.modal.showError('provinceName', result.message);
                return false;
            }

            // Check duplicate if name is valid
            if (name.length >= 3) {
                const dupeCheck = await this.validator.checkDuplicate(
                    name, 
                    'ir_check_province_name',
                    { id: this.currentId }
                );
                if (!dupeCheck.valid) {
                    this.modal.showError('provinceName', dupeCheck.message);
                    return false;
                }
            }

            return true;
        }

        async handleSave(formData) {
            // Only proceed if we have an ID
            if (!this.currentId) {
                console.warn('Update called without ID');
                return;
            }

            try {
                formData.append('id', this.currentId);
                formData.append('action', 'ir_update_province');
                formData.append('nonce', irSettings.nonce);

                console.log('Sending update data:', Object.fromEntries(formData));

                const response = await $.ajax({
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false
                });
                
                if (response.success) {
                    irToast.success('Provinsi berhasil diupdate');
                    this.modal.hide();
                    
                    irCache.remove('provinces');
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(this.currentId);
                    }
                } else {
                    if (response.data?.field) {
                        this.modal.showError(response.data.field, response.data.message);
                    } else {
                        irToast.error(response.data?.message || 'Gagal menyimpan data');
                    }
                }
            } catch (error) {
                console.error('Update error:', error);
                const message = error.responseJSON?.data?.message || 'Terjadi kesalahan sistem';
                irToast.error(message);
            }
        }

        onSuccess(id) {
            // Will be overridden in ProvinceManager
        }
    }

    // Export ProvinceUpdate
    window.irProvinceUpdate = ProvinceUpdate;

})(jQuery);