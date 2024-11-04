(function($) {
    'use strict';

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
            this.$submitButton = this.$modal.find('#btnSave');
            
            this.initializeFormEvents();
        }

        initializeFormEvents() {
            // Handle form submit
            this.$form.on('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });

            // Handle submit button click
            this.$submitButton.on('click', () => {
                this.$form.submit();
            });

            // Handle enter key
            this.$form.on('keypress', (e) => {
                if (e.which === 13) {
                    e.preventDefault();
                    this.handleSubmit();
                }
            });
        }

        async handleSubmit() {
            if (this.options.validator) {
                const isValid = await this.options.validator(this.$form);
                if (!isValid) return;
            }

            await this.options.onSave(this.getFormData());
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
            irHelper.form.clearErrors(this.$form);
        }

        onShow() {
            this.resetForm();
        }

        onHide() {
            this.resetForm();
        }

        showError(field, message) {
            irHelper.form.showError(this.$form, field, message);
        }

        setTitle(title) {
            this.$modal.find('.ir-modal-header h2').text(title);
        }
    }

    // Export FormModal
    window.irFormModal = FormModal;

})(jQuery);
