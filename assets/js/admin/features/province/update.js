/**
 * File: assets/js/admin/features/province/update.js
 * Version: 1.0.3
 * 
 * Changelog:
 * - Menghapus validateForm dan menggunakan irValidator
 * - Menambahkan auto-focus pada field nama provinsi
 * - Pemisahan logic load data
 * - Improved error handling
 */

(function($) {
    'use strict';

    class ProvinceUpdate {
        constructor() {
            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                mode: 'update'
            });

            this.currentId = null;
        }

        async show(id) {
            if (!id) return;

            try {
                this.currentId = id;
                this.modal.setMode('update');
                this.modal.setTitle('Edit Provinsi');

                const data = await this.loadProvinceData(id);
                if (data) {
                    this.modal.setFormData({
                        id: id,
                        name: data.name
                    });
                    this.modal.show();
                    
                    setTimeout(() => {
                        $('#provinceName').focus();
                    }, 100);
                }
            } catch (error) {
                console.error('Load error:', error);
                irToast.error('Gagal memuat data provinsi');
            }
        }

        async loadProvinceData(id) {
            const response = await $.ajax({
                url: irSettings.ajaxurl,
                type: 'POST',
                data: {
                    action: 'ir_get_province',
                    id: id,
                    nonce: irSettings.nonce
                }
            });

            return response.success ? response.data : null;
        }

        async handleSave(formData) {
            if (!this.currentId) return;

            try {
                formData.append('id', this.currentId);
                formData.append('action', 'ir_update_province');
                formData.append('nonce', irSettings.nonce);

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
                    irHelper.setHashId(this.currentId);
                    
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(this.currentId);
                    }
                } else {
                    this.handleError(response);
                }
            } catch (error) {
                console.error('Update error:', error);
                irToast.error('Terjadi kesalahan sistem');
            }
        }

        handleError(response) {
            if (response.data?.field) {
                this.modal.showError(response.data.field, response.data.message);
            } else {
                irToast.error(response.data?.message || 'Gagal menyimpan data');
            }
        }
    }

    window.irProvinceUpdate = ProvinceUpdate;

})(jQuery);