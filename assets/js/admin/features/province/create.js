/**
 * File: assets/js/admin/features/province/create.js
 * Version: 1.0.4
 * Description: Province creation handler
 * 
 * Changelog v1.0.4 (2024-11-17):
 * - Fix: Modal form conflict with update operation
 * - Fix: Removed unnecessary console logs
 * - Fix: Added proper event namespace
 * - Fix: Improved form submission handling
 */

(function($) {
    'use strict';

    class ProvinceCreate {
        constructor() {
            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                validator: (form) => this.validateForm(form),
                mode: 'create'
            });

            this.modal.$form[0].reset();
            this.initializeEvents();

            // Bind submit button langsung ke form
            this.modal.$submitButton.off('click').on('click', (e) => {
                e.preventDefault();
                this.modal.$form.submit();
            });

            // Bind form submit event
            this.modal.$form.off('submit').on('submit', async (e) => {
                e.preventDefault();
                if (!this.modal.isSubmitting) {
                    const formData = new FormData(e.target);
                    await this.handleSave(formData);
                }
            });
        }

        initializeEvents() {
            this.modal.$form.off('submit.createHandler').on('submit.createHandler', async (e) => {
                e.preventDefault();
                if (!this.modal.isSubmitting && this.modal.options.mode === 'create') {
                    const formData = new FormData(e.target);
                    await this.handleSave(formData);
                }
            });
        }

        show() {
            this.modal.resetForm();
            this.modal.setMode('create');
            this.modal.setTitle('Tambah Provinsi');
            this.modal.show();
        }
        
        async validateForm($form, mode) {
            try {
                if (mode !== 'create') return true; // Skip jika bukan mode create
                
                const name = $form.find('#provinceName').val();

                // Basic validation
                const result = irValidator.validateField('name', name);
                
                if (!result.valid) {
                    this.modal.showError('provinceName', result.message);
                    return false;
                }

                // Check duplicate
                try {
                    const response = await $.ajax({
                        url: irSettings.ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'ir_check_province_name',
                            name: name,
                            mode: 'create',
                            nonce: irSettings.nonce
                        }
                    });

                    if (!response.success) {
                        this.modal.showError('provinceName', response.data.message);
                        return false;
                    }
                } catch (error) {
                    return false;
                }
                return true;
            } catch (error) {
                this.modal.showError('provinceName', 'Gagal melakukan validasi');
                return false;
            }
        }

        async handleSave(formData) {
            try {
                formData.append('action', 'ir_create_province');
                formData.append('nonce', irSettings.nonce);

                const response = await $.ajax({
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false
                });

                if (response.success) {
                    irToast.success('Provinsi berhasil ditambahkan');
                    this.modal.hide();
                    
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(response.data);
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
            }
        }
    }

    // Export ProvinceCreate
    window.irProvinceCreate = ProvinceCreate;

})(jQuery);