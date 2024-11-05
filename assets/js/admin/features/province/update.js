/**
 * File: assets/js/admin/features/province/update.js
 * Version: 1.0.0
 * Revisi-3
 * 
 * Changelog:
 * - Fix validasi yang masih terpanggil saat mode create
 * - Penambahan pengecekan mode sebelum validasi
 * - Perbaikan log message untuk debugging
 * - Penambahan early return saat mode tidak sesuai
 * - Restrukturisasi validasi flow
 */

(function($) {
    'use strict';

    class ProvinceUpdate {
        constructor() {
            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                validator: (form, mode) => this.validateForm(form, mode),
                mode: 'update'
            });

            this.currentId = null;
        }

        async show(id) {
            if (!id) {
                console.warn('Update called without ID');
                return;
            }

            try {
                this.currentId = id;
                this.modal.setMode('update');
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

        async validateForm($form, mode) {
            // Early return jika bukan mode update
            if (mode !== 'update') {
                console.log('Skipping update validation - wrong mode:', mode);
                return true; // Return true agar validasi bisa dilanjutkan ke handler lain
            }

            // Early return jika tidak ada ID
            if (!this.currentId) {
                console.log('Skipping update validation - no ID');
                return false;
            }

            try {
                console.log('Running update validation for ID:', this.currentId);
                const name = $form.find('#provinceName').val().trim();
                
                // Basic validation
                const result = irValidator.validateField('name', name);
                if (!result.valid) {
                    this.modal.showError('provinceName', result.message);
                    return false;
                }

                // Check duplicate untuk update
                if (name.length >= 3) {
                    try {
                        const dupeCheck = await irValidator.checkDuplicate(
                            name,
                            'ir_check_province_name',
                            { 
                                mode: 'update',
                                id: this.currentId 
                            }
                        );
                        if (!dupeCheck.valid) {
                            this.modal.showError('provinceName', dupeCheck.message);
                            return false;
                        }
                    } catch (error) {
                        console.error('Duplicate check error:', error);
                        return false;
                    }
                }

                return true;
            } catch (error) {
                console.error('Validation error:', error);
                this.modal.showError('provinceName', 'Gagal melakukan validasi');
                return false;
            }
        }

        async handleSave(formData) {
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

    window.irProvinceUpdate = ProvinceUpdate;

})(jQuery);