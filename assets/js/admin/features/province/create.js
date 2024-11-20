/**
 * File: assets/js/admin/features/province/create.js
 * Version: 1.2.0
 * Last Updated: 2024-11-20 08:30:00
 * 
 * Changelog v1.2.0:
 * - Complete rewrite form data handling
 * - Add proper state management
 * - Improve validation flow
 * - Add comprehensive error handling
 * - Add console logging for debugging
 * - Fix event cleanup
 * - Match patterns with update.js
 */

(function($) {
    'use strict';

    class ProvinceCreate {
        constructor() {
            this.state = {
                isProcessing: false,
                lastValidatedName: null
            };

            this.modal = new irFormModal('provinceModal', {
                onSave: (formData) => this.handleSave(formData),
                validator: (form) => this.validateForm(form),
                mode: 'create',
                validationRules: {
                    required: true,
                    minLength: 3,
                    maxLength: 100,
                    pattern: /^[a-zA-Z\s]+$/,
                    messages: {
                        required: 'Nama provinsi tidak boleh kosong',
                        minLength: 'Nama provinsi minimal 3 karakter',
                        maxLength: 'Nama provinsi maksimal 100 karakter',
                        pattern: 'Nama provinsi hanya boleh mengandung huruf dan spasi'
                    }
                }
            });

            this.initializeEvents();
            console.log('ProvinceCreate: Initialized');
        }

        initializeEvents() {
            // Form submission handler
            this.modal.$form.off('submit').on('submit', async (e) => {
                e.preventDefault();
                
                const formValid = await this.validateForm(this.modal.$form);
                if (!formValid) {
                    console.log('ProvinceCreate: Form validation failed');
                    return;
                }

                if (!this.state.isProcessing) {
                    const formData = new FormData(e.target);
                    await this.handleSave(formData);
                }
            });

            // Modal close handler
            this.modal.$modal.on('hide.baseModal', () => {
                this.resetState();
            });

            console.log('ProvinceCreate: Events initialized');
        }

        resetState() {
            console.log('ProvinceCreate: Resetting state');
            this.state = {
                isProcessing: false,
                lastValidatedName: null
            };
            this.modal.clearErrors();
        }

        show() {
            console.log('ProvinceCreate: Showing create modal');
            this.modal.setMode('create');
            this.modal.setTitle('Tambah Provinsi');
            this.modal.resetForm();
            this.modal.show();
        }

        async validateForm($form) {
            try {
                const name = $form.find('#provinceName').val()?.trim();
                
                console.log('ProvinceCreate: Validating name:', name);

                // Skip if same as last validated
                if (name === this.state.lastValidatedName) {
                    return true;
                }

                // Basic validation
                if (!name) {
                    this.modal.showError('provinceName', 'Nama provinsi tidak boleh kosong');
                    return false;
                }

                // Check for duplicate name
                const response = await irAPI.province.checkName(name);
                if (!response.success) {
                    this.modal.showError('provinceName', 'Nama provinsi sudah digunakan');
                    return false;
                }

                // Update last validated name
                this.state.lastValidatedName = name;
                return true;

            } catch (error) {
                console.error('ProvinceCreate: Validation error:', error);
                this.modal.showError('provinceName', 'Gagal melakukan validasi');
                return false;
            }
        }

        async handleSave(formData) {
            if (this.state.isProcessing) {
                console.warn('ProvinceCreate: Save prevented - already processing');
                return;
            }

            this.state.isProcessing = true;
            this.modal.clearErrors();

            try {
                console.log('ProvinceCreate: Processing save');

                // Prepare form data
                formData.append('action', 'ir_create_province');
                formData.append('nonce', irSettings.nonce);

                const response = await irAPI.province.create(formData);

                if (response.success) {
                    console.log('ProvinceCreate: Save successful');
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
                console.error('ProvinceCreate: Save error:', error);
                irToast.error('Terjadi kesalahan sistem');
            } finally {
                this.state.isProcessing = false;
            }
        }

        destroy() {
            console.log('ProvinceCreate: Destroying instance');
            this.modal?.$form.off('submit');
            this.modal?.$modal.off('hide.baseModal');
            this.modal?.destroy();
            this.state = null;
        }

        // Callback placeholder - akan di-override oleh ProvinceManager
        onSuccess() {
            console.log('ProvinceCreate: Default success callback - should be overridden');
        }
    }

    // Export ProvinceCreate
    window.irProvinceCreate = ProvinceCreate;

})(jQuery);
