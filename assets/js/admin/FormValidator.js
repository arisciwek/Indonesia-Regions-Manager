(function($) {
    'use strict';

    window.FormValidator = class FormValidator {
        constructor() {
            this.rules = {
                name: {
                    minLength: 3,
                    maxLength: 100,
                    pattern: /^[a-zA-Z\s]+$/,  // Hanya huruf dan spasi
                    messages: {
                        required: 'Nama provinsi tidak boleh kosong',
                        minLength: 'Nama provinsi minimal 3 karakter',
                        maxLength: 'Nama provinsi maksimal 100 karakter',
                        pattern: 'Nama provinsi hanya boleh mengandung huruf dan spasi',
                        duplicate: 'Nama provinsi sudah ada'
                    }
                }
            };
            
            this.debounceTimer = null;
        }

        validateField(field, value) {
            const rule = this.rules[field];
            if (!rule) return { valid: true };

            // Trim value
            value = value.trim();

            // Required check
            if (!value) {
                return {
                    valid: false,
                    message: rule.messages.required
                };
            }

            // Length checks
            if (value.length < rule.minLength) {
                return {
                    valid: false,
                    message: rule.messages.minLength
                };
            }

            if (value.length > rule.maxLength) {
                return {
                    valid: false,
                    message: rule.messages.maxLength
                };
            }

            // Pattern check
            if (rule.pattern && !rule.pattern.test(value)) {
                return {
                    valid: false,
                    message: rule.messages.pattern
                };
            }

            return { valid: true };
        }

        checkDuplicate(value) {
            return new Promise((resolve) => {
                if (this.debounceTimer) {
                    clearTimeout(this.debounceTimer);
                }

                this.debounceTimer = setTimeout(() => {
                    $.ajax({
                        url: irSettings.ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'ir_check_province_name',
                            name: value,
                            nonce: irSettings.nonce
                        },
                        success: (response) => {
                            resolve({
                                valid: response.success,
                                message: response.success ? '' : this.rules.name.messages.duplicate
                            });
                        },
                        error: () => {
                            resolve({ valid: true }); // Fail silently on network error
                        }
                    });
                }, 500); // Debounce 500ms
            });
        }
    };

})(jQuery);