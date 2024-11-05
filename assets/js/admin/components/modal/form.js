(function($) {
    'use strict';
    //solusi-2: perbaikan handling modal dan form events

    class FormModal extends irBaseModal {
        constructor(modalId, options = {}) {
            // Call super first before accessing this
            super(modalId);
            
            this.options = {
                onSave: () => {},
                validator: null,
                ...options
            };

            // Initialize form elements after super
            this.$form = this.$modal.find('form');
            this.$submitButton = this.$modal.find('#btnSaveProvince');
            this.$cancelButton = this.$modal.find('#btnCancelProvince');
            
            this.initializeFormEvents();
        }

        initializeFormEvents() {
            // Handle form submit
            this.$form.on('submit', async (e) => {
                e.preventDefault();
                await this.handleSubmit();
            });

            // Handle submit button click
            this.$submitButton.on('click', (e) => {
                e.preventDefault();
                this.$form.submit();
            });

            // Handle cancel button click
            this.$cancelButton.on('click', (e) => {
                e.preventDefault();
                this.hide();
            });

            // Handle enter key
            this.$form.on('keypress', (e) => {
                if (e.which === 13) {
                    e.preventDefault();
                    this.$form.submit();
                }
            });
        }

        async handleSubmit() {
            // Clear any existing errors first
            this.clearErrors();

            if (this.options.validator) {
                const isValid = await this.options.validator(this.$form);
                if (!isValid) return;
            }

            // Disable submit button during save
            this.$submitButton.prop('disabled', true)
                            .text('Menyimpan...');

            try {
                await this.options.onSave(this.getFormData());
            } finally {
                // Re-enable submit button
                this.$submitButton.prop('disabled', false)
                                .text('Simpan');
            }
        }

        getFormData() {
            return new FormData(this.$form[0]);
        }

        setFormData(data) {
            Object.entries(data).forEach(([key, value]) => {
                this.$form.find(`[name="${key}"]`).val(value);
            });
        }

        resetForm() {
            this.$form[0].reset();
            this.clearErrors();
        }

        clearErrors() {
            this.$form.find('.ir-error-message').hide().text('');
            this.$form.find('.error').removeClass('error');
        }

        showError(field, message) {
            const $field = this.$form.find(`#${field}`);
            const $error = $field.siblings('.ir-error-message');
            $field.addClass('error');
            $error.text(message).show();
        }

        onShow() {
            this.resetForm();
        }

        onHide() {
            this.resetForm();
        }

        setTitle(title) {
            this.$modal.find('.ir-modal-header h2').text(title);
        }
    }

    // Export FormModal
    window.irFormModal = FormModal;

})(jQuery);