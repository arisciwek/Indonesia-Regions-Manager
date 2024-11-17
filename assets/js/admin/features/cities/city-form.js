/**
 * File: assets/js/admin/features/cities/city-form.js
 * Version: 1.0.0
 * Description: Form modal manager untuk create/update city dengan select dropdown
 * 
 * Changelog:
 * - v1.0.0: Initial release
 *   * Implementasi form modal untuk city
 *   * Validasi form khusus untuk city
 *   * Select dropdown untuk tipe kota/kabupaten
 *   * Integrasi dengan validator
 */

(function($) {
    'use strict';

    class CityForm extends irFormModal {
        constructor(provinceId) {
            console.log('[CityForm] Initializing with province ID:', provinceId);

            super(irConstants.SELECTORS.CITY.MODAL.substring(1), {
                onSave: (formData) => this.handleSave(formData),
                validator: (form) => this.validateForm(form),
                mode: 'create'
            });

            this.provinceId = provinceId;
            this.initializeTypeDropdown();
            this.setupCustomValidation();
        }

        /**
         * Initialize dropdown untuk tipe kota/kabupaten
         */
        initializeTypeDropdown() {
            console.log('[CityForm] Initializing type dropdown');
            
            const $typeSelect = this.$form.find(irConstants.SELECTORS.CITY.FORM.TYPE);
            $typeSelect.empty();
            
            // Add placeholder option
            $typeSelect.append(new Option('Pilih Tipe', '', true, true));
            
            // Add type options
            irConstants.VALIDATION.CITY.TYPES.forEach(type => {
                const label = type === 'kabupaten' ? 'Kabupaten' : 'Kota';
                $typeSelect.append(new Option(label, type));
            });
        }

        /**
         * Setup validasi khusus untuk city form
         */
        setupCustomValidation() {
            console.log('[CityForm] Setting up custom validation');
            
            // Add custom rules untuk city
            irValidator.addRule('cityName', {
                minLength: irConstants.VALIDATION.CITY.NAME.MIN_LENGTH,
                maxLength: irConstants.VALIDATION.CITY.NAME.MAX_LENGTH,
                pattern: irConstants.VALIDATION.CITY.NAME.PATTERN,
                messages: {
                    required: 'Nama kota/kabupaten tidak boleh kosong',
                    minLength: `Nama minimal ${irConstants.VALIDATION.CITY.NAME.MIN_LENGTH} karakter`,
                    maxLength: `Nama maksimal ${irConstants.VALIDATION.CITY.NAME.MAX_LENGTH} karakter`,
                    pattern: 'Nama hanya boleh mengandung huruf dan spasi',
                    duplicate: 'Nama kota/kabupaten sudah ada di provinsi ini'
                }
            });

            // Add custom rules untuk type
            irValidator.addRule('cityType', {
                messages: {
                    required: 'Tipe harus dipilih'
                }
            });
        }

        /**
         * Validasi form sebelum submit
         */
        async validateForm($form) {
            console.log('[CityForm] Validating form');
            
            try {
                const name = $form.find(irConstants.SELECTORS.CITY.FORM.NAME).val();
                const type = $form.find(irConstants.SELECTORS.CITY.FORM.TYPE).val();
                
                // Validate name
                const nameResult = irValidator.validateField('cityName', name);
                if (!nameResult.valid) {
                    this.showError('cityName', nameResult.message);
                    return false;
                }

                // Validate type
                if (!type) {
                    this.showError('cityType', irValidator.getRuleMessage('cityType', 'required'));
                    return false;
                }

                // Check duplicate if name is valid
                if (name.length >= irConstants.VALIDATION.CITY.NAME.MIN_LENGTH) {
                    const id = this.mode === 'update' ? this.currentId : 0;
                    const checkResult = await irAPI.city.checkName(name, this.provinceId, id);
                    
                    if (!checkResult.success) {
                        this.showError('cityName', irValidator.getRuleMessage('cityName', 'duplicate'));
                        return false;
                    }
                }

                return true;

            } catch (error) {
                console.error('[CityForm] Validation error:', error);
                this.showError('cityName', 'Gagal melakukan validasi');
                return false;
            }
        }

        /**
         * Reset form ke kondisi awal
         */
        resetForm() {
            super.resetForm();
            this.initializeTypeDropdown();
            console.log('[CityForm] Form reset complete');
        }

        /**
         * Set form data untuk mode update
         */
        setFormData(data) {
            console.log('[CityForm] Setting form data:', data);
            
            // Reset form first
            this.resetForm();

            // Map data to form fields
            const $form = this.$form;
            $form.find(irConstants.SELECTORS.CITY.FORM.NAME).val(data.name);
            $form.find(irConstants.SELECTORS.CITY.FORM.TYPE).val(data.type);

            // Trigger input events
            $form.find('input, select').trigger('input');

            console.log('[CityForm] Form data set complete');
        }

        /**
         * Handle form submission - akan di-override oleh CityCreate/CityUpdate
         */
        async handleSave(formData) {
            throw new Error('handleSave method must be implemented by child class');
        }

        /**
         * Update current province ID
         */
        setProvinceId(provinceId) {
            console.log('[CityForm] Updating province ID:', provinceId);
            this.provinceId = provinceId;
        }
    }

    // Export CityForm
    window.irCityForm = CityForm;

})(jQuery);