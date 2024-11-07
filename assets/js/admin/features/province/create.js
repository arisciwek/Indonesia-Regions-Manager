/**
 * File: assets/js/admin/features/province/create.js
 * Version: 1.0.3
 * 
 * Changelog:
 * - Fix: Submit button event binding
 * - Fix: Form submission handling
 * - Fix: Console logging pada submit event
 */

(function($) {
    'use strict';

    class ProvinceCreate {
        constructor() {
            console.log('[ProvinceCreate] Initializing...');
            
            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => {
                    console.log('[ProvinceCreate] onSave triggered');
                    return this.handleSave(formData);
                },
                validator: (form) => {
                    console.log('[ProvinceCreate] validator triggered');
                    return this.validateForm(form);
                },
                mode: 'create'
            });

            // Debug modal instance
            console.log('[ProvinceCreate] Modal initialized:', {
                modalElement: this.modal.$modal,
                formElement: this.modal.$form,
                submitButton: this.modal.$submitButton
            });

            // Bind submit button langsung ke form
            this.modal.$submitButton.off('click').on('click', (e) => {
                console.log('[ProvinceCreate] Submit button clicked');
                e.preventDefault();
                this.modal.$form.submit();
            });

            // Bind form submit event
            this.modal.$form.off('submit').on('submit', async (e) => {
                console.log('[ProvinceCreate] Form submitted');
                e.preventDefault();
                if (!this.modal.isSubmitting) {
                    const formData = new FormData(e.target);
                    console.log('[ProvinceCreate] Form data:', Array.from(formData.entries()));
                    await this.handleSave(formData);
                }
            });
        }

        show() {
            console.log('[ProvinceCreate] Show modal triggered');
            this.modal.resetForm();
            this.modal.setMode('create');
            this.modal.setTitle('Tambah Provinsi');
            
            // Debug form state before show
            console.log('[ProvinceCreate] Form state before show:', {
                form: this.modal.$form.serialize(),
                mode: this.modal.options.mode
            });
            
            this.modal.show();
        }

        async validateForm($form) {
            console.log('[ProvinceCreate] Validating form...');
            
            try {
                const name = $form.find('#provinceName').val();
                console.log('[ProvinceCreate] Field value:', {
                    rawName: $form.find('#provinceName').val(),
                    trimmedName: name.trim(),
                    fieldExists: $form.find('#provinceName').length > 0
                });
                
                // Basic validation
                const result = irValidator.validateField('name', name);
                console.log('[ProvinceCreate] Validation result:', result);
                
                if (!result.valid) {
                    console.log('[ProvinceCreate] Validation failed:', result.message);
                    this.modal.showError('provinceName', result.message);
                    return false;
                }

                // Check duplicate if name is valid
                if (name.length >= 3) {
                    console.log('[ProvinceCreate] Checking duplicate name');
                    
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

                        console.log('[ProvinceCreate] Duplicate check response:', response);

                        if (!response.success) {
                            console.log('[ProvinceCreate] Duplicate found:', response.data);
                            this.modal.showError('provinceName', response.data.message);
                            return false;
                        }
                    } catch (error) {
                        console.error('[ProvinceCreate] Duplicate check error:', error);
                        return false;
                    }
                }

                console.log('[ProvinceCreate] Validation passed');
                return true;
            } catch (error) {
                console.error('[ProvinceCreate] Validation error:', error);
                this.modal.showError('provinceName', 'Gagal melakukan validasi');
                return false;
            }
        }

        async handleSave(formData) {
            console.log('[ProvinceCreate] Handling save...', {
                formData: Array.from(formData.entries())
            });
            
            try {
                formData.append('action', 'ir_create_province');
                formData.append('nonce', irSettings.nonce);

                console.log('[ProvinceCreate] Sending request with data:', {
                    action: formData.get('action'),
                    name: formData.get('name'),
                    nonce: formData.get('nonce')
                });

                const response = await $.ajax({
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false
                });

                console.log('[ProvinceCreate] Save response:', response);

                if (response.success) {
                    console.log('[ProvinceCreate] Save successful:', response.data);
                    irToast.success('Provinsi berhasil ditambahkan');
                    this.modal.hide();
                    
                    if (typeof this.onSuccess === 'function') {
                        console.log('[ProvinceCreate] Calling onSuccess callback');
                        this.onSuccess(response.data);
                    }
                } else {
                    console.log('[ProvinceCreate] Save failed:', response.data);
                    if (response.data?.field) {
                        this.modal.showError(response.data.field, response.data.message);
                    } else {
                        irToast.error(response.data?.message || 'Gagal menyimpan data');
                    }
                }
            } catch (error) {
                console.error('[ProvinceCreate] Save error:', error);
                irToast.error('Terjadi kesalahan sistem');
            }
        }
    }

    // Export ProvinceCreate
    window.irProvinceCreate = ProvinceCreate;

})(jQuery);