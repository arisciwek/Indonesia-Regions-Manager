(function($) {
    'use strict';

    class ProvinceCreate {
        constructor() {
            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                validator: (form) => this.validateForm(form),
                mode: 'create'
            });
        }

        show() {
            this.modal.resetForm();
            this.modal.setMode('create');
            this.modal.setTitle('Tambah Provinsi');
            this.modal.show();
        }

        async validateForm($form) {
            try {
                const name = $form.find('#provinceName').val().trim();
                
                // Basic validation
                const result = irValidator.validateField('name', name);
                if (!result.valid) {
                    this.modal.showError('provinceName', result.message);
                    return false;
                }

                // Check duplicate if name is valid
                if (name.length >= 3) {
                    try {
                        const dupeCheck = await irValidator.checkDuplicate(
                            name,
                            'ir_check_province_name',
                            { mode: 'create' }
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

        // handleSave method tetap sama
    }

    window.irProvinceCreate = ProvinceCreate;

})(jQuery);