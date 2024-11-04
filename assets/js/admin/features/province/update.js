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
            this.currentId = id;
            this.modal.setTitle('Edit Provinsi');

            try {
                const data = await this.loadProvinceData(id);
                if (data) {
                    this.modal.setFormData(data);
                    this.modal.show();
                }
            } catch (error) {
                irToast.error('Gagal memuat data provinsi');
                console.error('Load province error:', error);
            }
        }

        async loadProvinceData(id) {
            // Check cache first
            let data = irCache.get('provinces', id);
            
            if (!data) {
                const response = await irAPI.province.get(id);
                if (response.success) {
                    data = response.data;
                    irCache.set('provinces', id, data);
                }
            }

            return data;
        }

        async validateForm($form) {
            const name = $form.find('#provinceName').val();
            
            // Basic validation
            const result = this.validator.validateField('name', name);
            if (!result.valid) {
                this.modal.showError('provinceName', result.message);
                return false;
            }

            // Check duplicate
            if (name.trim().length >= 3) {
                const dupeCheck = await this.validator.checkDuplicate(name, 'ir_check_province_name', {
                    id: this.currentId
                });
                if (!dupeCheck.valid) {
                    this.modal.showError('provinceName', dupeCheck.message);
                    return false;
                }
            }

            return true;
        }

        async handleSave(formData) {
            try {
                formData.append('id', this.currentId);
                const response = await irAPI.province.update(formData);
                
                if (response.success) {
                    irToast.success('Provinsi berhasil diupdate');
                    this.modal.hide();
                    
                    // Update cache and table
                    irCache.remove('provinces', this.currentId);
                    this.onSuccess(this.currentId, formData);
                } else {
                    if (response.data.field) {
                        this.modal.showError(response.data.field, response.data.message);
                    } else {
                        irToast.error(response.data.message || 'Gagal mengupdate data');
                    }
                }
            } catch (error) {
                console.error('Update error:', error);
                irToast.error('Terjadi kesalahan sistem');
            }
        }

        // Callback ketika update success
        onSuccess(id, formData) {
            // Override di ProvinceManager
        }
    }

    // Export ProvinceUpdate
    window.irProvinceUpdate = ProvinceUpdate;

})(jQuery);
