/**
 * File: assets/js/admin/features/province/update.js 
 * Version: 1.0.6
 * Revisi: Fix nilai field tidak terisi
 * 
 * Changelog:
 * - Fix: Perbaikan metode pengisian nilai field
 * - Fix: Penambahan delay untuk memastikan modal sudah terbuka
 * - Fix: Verifikasi field existence sebelum set value
 */

(function($) {
    'use strict';

    class ProvinceUpdate {
        constructor() {
            console.log('ProvinceUpdate: Initializing...');
            
            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                mode: 'update'
            });

            this.currentId = null;
            this.currentData = null;
        }

        async show(id) {
            if (!id) {
                console.error('ProvinceUpdate: Invalid ID');
                return;
            }

            try {
                this.currentId = id;
                console.log('ProvinceUpdate: Loading data for ID', id);

                const data = await this.loadProvinceData(id);
                
                if (!data || !data.name) {
                    console.error('ProvinceUpdate: Invalid data received', data);
                    irToast.error('Data provinsi tidak valid');
                    return;
                }

                this.currentData = data;
                console.log('ProvinceUpdate: Data loaded', data);

                // Update modal state
                this.modal.setMode('update');
                this.modal.setTitle('Edit Provinsi');
                
                // Show modal first
                this.modal.show();

                // Wait for modal to be fully shown
                setTimeout(() => {
                    this.setFormData(data);
                }, 100);

            } catch (error) {
                console.error('ProvinceUpdate: Load error', error);
                irToast.error('Gagal memuat data provinsi');
            }
        }

        setFormData(data) {
            // Verify elements exist
            const form = document.getElementById('provinceForm');
            const nameField = document.getElementById('provinceName');

            console.log('ProvinceUpdate: Setting form data', {
                formExists: !!form,
                fieldExists: !!nameField,
                data: data
            });

            if (!form || !nameField) {
                console.error('ProvinceUpdate: Required elements not found');
                return;
            }

            // Reset form
            form.reset();

            // Set value using both jQuery and native methods
            $(nameField).val(data.name);
            nameField.value = data.name;

            console.log('ProvinceUpdate: Form data set', {
                jqueryValue: $(nameField).val(),
                nativeValue: nameField.value,
                fieldValue: $('#provinceName').val()
            });

            // Trigger input event
            $(nameField).trigger('input');

            // Verify value was set
            setTimeout(() => {
                console.log('ProvinceUpdate: Final field value', {
                    value: $('#provinceName').val(),
                    elementValue: document.getElementById('provinceName').value
                });
            }, 100);
        }

        async loadProvinceData(id) {
            try {
                console.log('ProvinceUpdate: Requesting data for ID', id);

                const response = await $.ajax({
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'ir_get_province',
                        id: id,
                        nonce: irSettings.nonce
                    }
                });

                console.log('ProvinceUpdate: Server response', response);

                if (!response.success) {
                    throw new Error(response.data?.message || 'Failed to load data');
                }

                return response.data;

            } catch (error) {
                console.error('ProvinceUpdate: Load data error', error);
                throw error;
            }
        }

        async handleSave(formData) {
            if (!this.currentId) {
                console.error('ProvinceUpdate: No current ID set');
                return;
            }

            try {
                const name = formData.get('name');
                console.log('ProvinceUpdate: Saving data', {
                    id: this.currentId,
                    name: name
                });

                if (!name) {
                    console.error('ProvinceUpdate: Name is empty');
                    this.modal.showError('provinceName', 'Nama provinsi tidak boleh kosong');
                    return;
                }

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
                
                console.log('ProvinceUpdate: Save response', response);

                if (response.success) {
                    irToast.success('Provinsi berhasil diupdate');
                    this.modal.hide();
                    irCache.remove('provinces', this.currentId);
                    irHelper.setHashId(this.currentId);
                    
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(this.currentId);
                    }
                } else {
                    this.handleError(response);
                }
            } catch (error) {
                console.error('ProvinceUpdate: Save error', error);
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