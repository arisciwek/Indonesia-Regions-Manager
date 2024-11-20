/**
 * File: assets/js/admin/components/modal/form.js
 * Version: 1.1.3
 * Last Updated: 2024-11-20 10:30:00
 * 
 * Changelog v1.1.3:
 * - Add: validateField method yang sebelumnya hilang
 * - Add: validateFieldValue untuk validasi nilai input
 * - Fix: Error handling pada validasi field
 * - Fix: Integrasi dengan custom validator
 * - Add: Log system untuk debugging validasi
 * 
 * Changelog v1.1.2:
 * - Add: setFormData method untuk update form
 * - Fix: State management saat set data
 * - Fix: Cleanup handling untuk form values
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
                validationRules: {
                    required: true,
                    minLength: 3,
                    maxLength: 100,
                    pattern: /^[a-zA-Z\s]+$/,
                    messages: {
                        required: 'Field ini wajib diisi',
                        minLength: 'Minimal 3 karakter',
                        maxLength: 'Maksimal 100 karakter',
                        pattern: 'Hanya huruf dan spasi diperbolehkan'
                    }
                },
                ...options
            };

            this.state = {
                isSubmitting: false,
                currentMode: this.options.mode,
                hasChanges: false,
                validationErrors: {},
                isValid: true
            };

            this.initializeFormElements();
            this.initializeValidation();
            this.initializeFormEvents();
        }

        initializeFormElements() {
            this.$form = this.$modal.find('form');
            if (!this.$form.length) {
                console.error('FormModal: Form element not found');
                return false;
            }

            this.$submitButton = this.$modal.find('[type="submit"]');
            this.$cancelButton = this.$modal.find('[data-action="cancel"], .ir-modal-close');
            this.$inputs = this.$form.find('input[required], select[required], textarea[required]');
            this.$firstInput = this.$inputs.first();

            return true;
        }

        initializeValidation() {
            this.debouncedValidate = this.debounce((field, value) => {
                this.validateField(field, value);
            }, 300);
        }

        initializeFormEvents() {
            this.cleanupEvents();

            if (this.$inputs?.length) {
                this.$inputs.on('input.formModal change.formModal', (e) => {
                    const $field = $(e.target);
                    this.debouncedValidate($field.attr('id'), $field.val());
                    this.handleInputChange(e);
                });
            }

            if (this.$form?.length) {
                this.$form.on('submit.formModal', async (e) => {
                    e.preventDefault();
                    if (!this.state.isSubmitting) {
                        await this.handleSubmit();
                    }
                });
            }

            if (this.$cancelButton?.length) {
                this.$cancelButton.on('click.formModal', (e) => {
                    e.preventDefault();
                    this.handleCancel();
                });
            }

            // Bind submit button directly to form submit
            if (this.$submitButton?.length) {
                this.$submitButton.off('click.formModal').on('click.formModal', (e) => {
                    e.preventDefault();
                    this.$form.submit();
                });
            }
        }

        /**
         * Validate a single field
         */
        validateField(fieldId, value) {
            console.log('FormModal: Validating field:', fieldId, value);

            try {
                const $field = this.$form.find(`#${fieldId}`);
                if (!$field.length) return;

                const $formGroup = $field.closest('.ir-form-group');
                if (!$formGroup.length) return;

                // Clear existing errors
                this.clearFieldError(fieldId);

                // Get validation rules
                const rules = this.options.validationRules;
                
                // Basic validations
                const validationResult = this.validateFieldValue(value, rules);
                
                if (!validationResult.isValid) {
                    this.showError(fieldId, validationResult.message);
                    return false;
                }

                return true;

            } catch (error) {
                console.error('FormModal: Field validation error:', error);
                return false;
            }
        }

        /**
         * Validate field value against rules
         */
        validateFieldValue(value, rules) {
            // Required check
            if (rules.required && (!value || !value.trim())) {
                return {
                    isValid: false,
                    message: rules.messages.required
                };
            }

            value = value ? value.trim() : '';

            // Skip other validations if empty and not required
            if (!value) {
                return { isValid: true };
            }

            // Length checks
            if (rules.minLength && value.length < rules.minLength) {
                return {
                    isValid: false,
                    message: rules.messages.minLength
                };
            }

            if (rules.maxLength && value.length > rules.maxLength) {
                return {
                    isValid: false,
                    message: rules.messages.maxLength
                };
            }

            // Pattern check
            if (rules.pattern && !rules.pattern.test(value)) {
                return {
                    isValid: false,
                    message: rules.messages.pattern
                };
            }

            return { isValid: true };
        }

        setFormData(data) {
            if (!this.$form?.length || !data) return;

            // Reset form sebelum set data baru
            this.$form[0].reset();
            this.clearErrors();

            // Set nilai untuk setiap field
            Object.entries(data).forEach(([key, value]) => {
                const $field = this.$form.find(`[name="${key}"]`);
                if ($field.length) {
                    $field.val(value);
                    // Trigger change untuk aktivasi validasi
                    $field.trigger('change');
                }
            });

            // Reset state
            this.state.hasChanges = false;
            this.state.isSubmitting = false;
            this.updateFormValidity();
        }

        async handleSubmit() {
            if (this.state.isSubmitting) return;
            
            try {
                this.state.isSubmitting = true;
                this.$submitButton?.prop('disabled', true);

                const formData = new FormData(this.$form[0]);
                const isValid = await this.validateForm(this.$form);

                if (!isValid) {
                    throw new Error('Form validation failed');
                }

                await this.options.onSave(formData);
                
            } catch (error) {
                console.error('FormModal: Submit error:', error);
                if (!this.hasVisibleErrors()) {
                    irToast.error('Gagal menyimpan data');
                }
            } finally {
                this.state.isSubmitting = false;
                this.$submitButton?.prop('disabled', false);
            }
        }

        handleInputChange(e) {
            const $field = $(e.target);
            const $formGroup = $field.closest('.ir-form-group');
            
            // Clear validation error
            if ($formGroup.length) {
                $formGroup.find('.ir-error-message').hide();
                $field.removeClass('error');
            }

            // Track changes
            this.state.hasChanges = true;
        }

        handleCancel() {
            if (this.state.hasChanges && !confirm('Perubahan belum disimpan. Yakin ingin menutup?')) {
                return;
            }
            this.hide();
        }

        async validateForm($form) {
            if (typeof this.options.validator !== 'function') {
                return true;
            }

            try {
                return await this.options.validator($form, this.state.currentMode);
            } catch (error) {
                console.error('FormModal: Validation error:', error);
                return false;
            }
        }

        setMode(mode) {
            this.state.currentMode = mode;
            this.options.mode = mode;
        }

        clearErrors() {
            if (!this.$form) return;
            
            this.$form.find('.ir-error-message').hide();
            this.$form.find('.error').removeClass('error');
            this.state.validationErrors = {};
            this.updateFormValidity();
        }

        clearFieldError(fieldId) {
            const $field = this.$form.find(`#${fieldId}`);
            const $formGroup = $field.closest('.ir-form-group');
            const $error = $formGroup.find('.ir-error-message');

            $field.removeClass('error');
            $error.hide();

            delete this.state.validationErrors[fieldId];
            this.updateFormValidity();
        }

        showError(fieldId, message) {
            const $field = this.$form.find(`#${fieldId}`);
            const $formGroup = $field.closest('.ir-form-group');
            const $error = $formGroup.find('.ir-error-message');

            $field.addClass('error');
            $error.text(message).show();

            this.state.validationErrors[fieldId] = message;
            this.updateFormValidity();
        }

        updateFormValidity() {
            this.state.isValid = Object.keys(this.state.validationErrors).length === 0;
            this.$submitButton?.prop('disabled', !this.state.isValid);
        }

        hasVisibleErrors() {
            return this.$form?.find('.ir-error-message:visible').length > 0;
        }

        cleanupEvents() {
            this.$form?.off('.formModal');
            this.$inputs?.off('.formModal');
            this.$cancelButton?.off('.formModal');
            this.$submitButton?.off('.formModal');
        }

        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    }

    window.irFormModal = FormModal;

})(jQuery);
