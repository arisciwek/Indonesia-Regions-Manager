/**
 * File: assets/js/admin/components/modal/form.js
 * Version: 1.0.1
 * Revisi-3
 * 
 * Changelog:
 * - Mengembalikan method initializeFormEvents yang hilang
 * - Fix typo pada event binding
 * - Perbaikan handling mode pada event initialization
 * - Memastikan proper event cleanup saat destroy
 * - Perbaikan urutan method untuk readability
 */

(function($) {
    'use strict';

    class FormModal extends irBaseModal {
        constructor(modalId, options = {}) {
            super(modalId);
            
            this.options = {
                onSave: () => {},
                validator: null,
                mode: 'create',
                ...options
            };

            this.$form = this.$modal.find('form');
            this.$submitButton = this.$modal.find('#btnSaveProvince');
            this.$cancelButton = this.$modal.find('#btnCancelProvince');
            
            this.isSubmitting = false;
            this.initializeFormEvents();
        }

        initializeFormEvents() {
            // Cleanup existing events first
            this.cleanupEvents();

            // Handle form submit
            this.$form.on('submit.formModal', async (e) => {
                e.preventDefault();
                if (!this.isSubmitting) {
                    await this.handleSubmit();
                }
            });

            // Handle submit button click
            this.$submitButton.on('click.formModal', async (e) => {
                e.preventDefault();
                if (!this.isSubmitting) {
                    await this.handleSubmit();
                }
            });

            // Handle cancel button click
            this.$cancelButton.on('click.formModal', (e) => {
                e.preventDefault();
                this.hide();
            });

            // Override close button from parent class
            this.$close.off('click').on('click.formModal', (e) => {
                e.preventDefault();
                this.hide();
            });

            // Handle enter key
            this.$form.on('keypress.formModal', async (e) => {
                if (e.which === 13 && !e.shiftKey) {
                    e.preventDefault();
                    if (!this.isSubmitting) {
                        await this.handleSubmit();
                    }
                }
            });

            // Clear validation errors when input changes
            this.$form.find('input, select, textarea').on('input.formModal', (e) => {
                const $field = $(e.target);
                const $formGroup = $field.closest('.ir-form-group');
                $formGroup.find('.ir-error-message').hide();
                $field.removeClass('error');
            });
        }

        async handleSubmit() {
            if (this.isSubmitting) return;
            
            try {
                this.isSubmitting = true;
                this.$submitButton.prop('disabled', true);
                
                this.clearErrors();

                // Get the form data
                const formData = new FormData(this.$form[0]);

                // Run validator sesuai mode
                if (this.options.validator) {
                    const isValid = await this.options.validator(this.$form, this.options.mode);
                    if (!isValid) {
                        console.log('Form validation failed');
                        return;
                    }
                }

                // If validation passes, proceed with save
                await this.options.onSave(formData);
                
            } catch (error) {
                console.error('Form submission error:', error);
                irToast.error('Gagal menyimpan data');
            } finally {
                this.isSubmitting = false;
                this.$submitButton.prop('disabled', false);
            }
        }

        getFormData() {
            return new FormData(this.$form[0]);
        }

        setFormData(data) {
            Object.entries(data).forEach(([key, value]) => {
                const $field = this.$form.find(`[name="${key}"]`);
                if ($field.length) {
                    $field.val(value);
                }
            });
        }

        resetForm() {
            this.$form[0].reset();
            this.clearErrors();
            this.isSubmitting = false;
            this.$submitButton.prop('disabled', false);
        }

        clearErrors() {
            this.$form.find('.ir-error-message').hide();
            this.$form.find('.error').removeClass('error');
        }

        cleanupEvents() {
            this.$form.off('.formModal');
            this.$submitButton.off('.formModal');
            this.$cancelButton.off('.formModal');
            this.$close.off('.formModal');
            this.$form.find('input, select, textarea').off('.formModal');
        }

        onShow() {
            this.resetForm();
        }

        onHide() {
            this.resetForm();
        }

        showError(fieldId, message) {
            const $field = this.$form.find(`#${fieldId}`);
            const $error = $field.siblings('.ir-error-message');
            $field.addClass('error');
            $error.text(message).show();
        }

        setTitle(title) {
            this.$modal.find('.ir-modal-header h2').text(title);
        }

        setMode(mode) {
            this.options.mode = mode;
        }

        destroy() {
            this.cleanupEvents();
            super.destroy && super.destroy();
        }
    }

    window.irFormModal = FormModal;

})(jQuery);