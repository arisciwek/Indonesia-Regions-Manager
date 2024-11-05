(function($) {
    'use strict';
    //solusi-2: perbaikan create province dengan form handling yang lebih baik

    class ProvinceCreate {
        constructor() {
            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                validator: (form) => this.validateForm(form)
            });

            this.validator = irValidator;
        }

        show() {
            this.modal.setTitle('Tambah Provinsi');
            this.modal.resetForm();
            this.modal.show();
        }

        async validateForm($form) {
            const name = $form.find('#provinceName').val().trim();
            
            // Basic validation
            if (!name) {
                this.modal.showError('provinceName', 'Nama provinsi tidak boleh kosong');
                return false;
            }

            // Validasi dengan validator
            const result = this.validator.validateField('name', name);
            if (!result.valid) {
                this.modal.showError('provinceName', result.message);
                return false;
            }

            // Check duplicate jika nama valid
            if (name.length >= 3) {
                try {
                    const dupeCheck = await this.validator.checkDuplicate(
                        name, 
                        irConstants.ENDPOINTS.PROVINCE.CHECK_NAME
                    );
                    if (!dupeCheck.valid) {
                        this.modal.showError('provinceName', dupeCheck.message);
                        return false;
                    }
                } catch (error) {
                    console.error('Validation error:', error);
                    irToast.error('Terjadi kesalahan saat validasi');
                    return false;
                }
            }

            return true;
        }

        async handleSave(formData) {
            try {
                const response = await irAPI.province.create(formData);
                
                if (response.success) {
                    irToast.success('Provinsi berhasil ditambahkan');
                    this.modal.hide();
                    
                    // Update cache dan table
                    irCache.remove(irConstants.CACHE_KEYS.PROVINCE);
                    
                    // Trigger event sukses
                    $(document).trigger(irConstants.EVENTS.PROVINCE.CREATED, [response.data]);
                    
                    // Callback untuk ProvinceManager
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess(response.data);
                    }
                } else {
                    // Handle error spesifik field
                    if (response.data && response.data.field) {
                        this.modal.showError(response.data.field, response.data.message);
                    } else {
                        irToast.error(response.data.message || 'Gagal menyimpan data');
                    }
                }
            } catch (error) {
                console.error('Save error:', error);
                irToast.error('Terjadi kesalahan sistem');
            }
        }

        // Callback ketika create success - akan di-override di ProvinceManager
        onSuccess(data) {
            // Override di ProvinceManager
        }
    }

    // Export ProvinceCreate
    window.irProvinceCreate = ProvinceCreate;

})(jQuery);