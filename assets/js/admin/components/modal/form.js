/**
 * File: assets/js/admin/components/modal/form.js
 * Version: 1.0.0
 * Revisi-1
 * 
 * Changelog:
 * - Fix event handling untuk submit
 * - Prevent double submission
 * - Fix form data handling
 * - Add debug logs
 * 
 * Dependencies:
 * - jQuery
 * - irBaseModal
 * - irValidator
 * - irHelper
 */

(function($) {
    'use strict';

    class FormModal extends irBaseModal {
        constructor(modalId, options = {}) {
            super(modalId);
            
            this.options = {
                onSave: () => {},
                validator: null,
                ...options
            };

            this.$form = this.$modal.find('form');
            this.$submitButton = this.$modal.find('#btnSaveProvince');
            this.$cancelButton = this.$modal.find('#btnCancelProvince');
            
            this.initializeFormEvents();
        }

        initializeFormEvents() {
            // Prevent default form submission
            this.$form.on('submit', (e) => {
                e.preventDefault();
            });

            // Handle submit button click
            this.$submitButton.on('click', async (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent event bubbling
                await this.handleSubmit();
            });

            // Handle cancel button click
            this.$cancelButton.on('click', (e) => {
                e.preventDefault();
                this.hide();
            });

            // Override close button from parent class
            this.$close.off('click').on('click', (e) => {
                e.preventDefault();
                this.hide();
            });

            // Handle enter key
            this.$form.on('keypress', async (e) => {
                if (e.which === 13 && !e.shiftKey) {
                    e.preventDefault();
                    await this.handleSubmit();
                }
            });

            // Clear validation errors on input
            this.$form.find('input, select, textarea').on('input', (e) => {
                const $field = $(e.target);
                const $formGroup = $field.closest('.ir-form-group');
                $formGroup.find('.ir-error-message').hide();
                $field.removeClass('error');
            });
        }

        async handleSubmit() {
            try {
                console.log('Form submission started');
                
                // Clear errors first
                this.clearErrors();

                // Get form data
                const formData = new FormData(this.$form[0]);
                console.log('Form data collected:', Object.fromEntries(formData));

                // Validate if validator provided
                if (this.options.validator) {
                    const isValid = await this.options.validator(this.$form);
                    if (!isValid) {
                        console.log('Form validation failed');
                        return;
                    }
                }

                // Call onSave callback
                await this.options.onSave(formData);
                
            } catch (error) {
                console.error('Form submission error:', error);
                irToast.error('Gagal menyimpan data');
            }
        }

        getFormData() {
            return new FormData(this.$form[0]);
        }

        setFormData(data) {
            this.$form[0].reset(); // Clear form first
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
        }

        clearErrors() {
            this.$form.find('.ir-error-message').hide();
            this.$form.find('.error').removeClass('error');
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

        onShow() {
            this.resetForm();
        }

        onHide() {
            this.resetForm();
        }
    }

    // Export FormModal
    window.irFormModal = FormModal;

})(jQuery);