/**
 * File: assets/js/admin/components/modal/form.js
 * Version: 1.0.5
 * Last Updated: 2024-11-20 07:30:00
 * 
 * Changelog v1.0.5:
 * - Fix: Form validation timing dan error message
 * - Fix: Cancel button functionality
 * - Fix: Form state management
 * - Fix: Event handling cleanup
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

            this.state = {
                isSubmitting: false,
                currentMode: this.options.mode,
                hasChanges: false,
                validationErrors: {}
            };

            this.initializeFormElements();
            this.initializeFormEvents();
        }

        initializeFormElements() {
            this.$form = this.$modal.find('form');
            this.$submitButton = this.$modal.find('[type="submit"]');
            this.$cancelButton = this.$modal.find('[data-action="cancel"], .ir-modal-close, #btnCancelProvince');
            this.$inputs = this.$form.find('input, select, textarea');
            this.$firstInput = this.$inputs.first();

            if (!this.$form.length) {
                console.error('FormModal: Form element not found');
                return;
            }
        }

        initializeFormEvents() {
            // Cleanup existing events
            this.$form.off('.formModal');
            this.$inputs.off('.formModal');
            this.$cancelButton.off('.formModal');
            this.$submitButton.off('.formModal');

            // Form submit
            this.$form.on('submit.formModal', async (e) => {
                e.preventDefault();
                if (!this.state.isSubmitting) {
                    await this.handleSubmit();
                }
            });

            // Input change
            this.$inputs.on('input.formModal change.formModal', (e) => {
                this.handleInputChange(e);
            });

            // Cancel button
            this.$cancelButton.on('click.formModal', (e) => {
                e.preventDefault();
                this.handleCancel();
            });

            // Submit button
            this.$submitButton.on('click.formModal', (e) => {
                e.preventDefault();
                if (!this.state.isSubmitting) {
                    this.$form.submit();
                }
            });
        }

        async handleSubmit() {
            if (this.state.isSubmitting) return;
            
            try {
                this.startSubmitting();
                
                // Get form data before clearing errors
                const formData = new FormData(this.$form[0]);
                
                // Clear previous errors
                this.clearErrors();

                // Validate form
                const isValid = await this.validateForm();
                if (!isValid) {
                    return;
                }

                // Process save
                await this.options.onSave(formData);
                
            } catch (error) {
                this.handleError(error);
            } finally {
                this.endSubmitting();
            }
        }

        startSubmitting() {
            this.state.isSubmitting = true;
            this.$submitButton.prop('disabled', true)
                .html('<span class="spinner is-active"></span> Menyimpan...');
        }

        endSubmitting() {
            this.state.isSubmitting = false;
            this.$submitButton.prop('disabled', false)
                .text('Simpan');
        }

        async validateForm() {
            if (typeof this.options.validator !== 'function') {
                return true;
            }

            try {
                const $form = this.$form;
                const mode = this.state.currentMode;

                // Set timeout untuk memastikan nilai form sudah terupdate
                await new Promise(resolve => setTimeout(resolve, 0));

                return await this.options.validator($form, mode);
            } catch (error) {
                console.error('FormModal: Validation error:', error);
                return false;
            }
        }

        handleInputChange(e) {
            const $field = $(e.target);
            const $formGroup = $field.closest('.ir-form-group');
            
            // Clear validation error
            $formGroup.find('.ir-error-message').hide();
            $field.removeClass('error');

            // Track changes
            this.state.hasChanges = true;
        }

        handleCancel() {
            if (this.state.hasChanges && !confirm('Perubahan belum disimpan. Yakin ingin menutup?')) {
                return;
            }
            this.hide();
        }

        show() {
            super.show();
            this.focusFirstInput();
        }

        focusFirstInput() {
            if (this.$firstInput.length) {
                setTimeout(() => this.$firstInput.focus(), 100);
            }
        }

        setFormData(data) {
            this.resetForm();

            Object.entries(data).forEach(([key, value]) => {
                const $field = this.$form.find(`[name="${key}"]`);
                if ($field.length) {
                    $field.val(value);
                    $field.trigger('change');
                }
            });

            this.state.hasChanges = false;
        }

        resetForm() {
            this.$form[0].reset();
            this.clearErrors();
            this.state.isSubmitting = false;
            this.state.hasChanges = false;
            this.$submitButton.prop('disabled', false);
        }

        clearErrors() {
            this.$form.find('.ir-error-message').hide();
            this.$form.find('.error').removeClass('error');
            this.state.validationErrors = {};
        }

        showError(fieldId, message) {
            const $field = this.$form.find(`#${fieldId}`);
            const $error = $field.siblings('.ir-error-message');
            
            $field.addClass('error');
            $error.text(message).show();
            
            this.state.validationErrors[fieldId] = message;
        }

        hide() {
            this.resetForm();
            super.hide();
        }

        destroy() {
            this.$form.off('.formModal');
            this.$inputs.off('.formModal');
            this.$cancelButton.off('.formModal');
            this.$submitButton.off('.formModal');
            super.destroy && super.destroy();
        }
    }

    window.irFormModal = FormModal;

})(jQuery);
