/**
 * File: assets/js/admin/modules/validator.js
 * Version: 1.0.0
 * Revisi-4
 * Deskripsi: Form validator untuk provinsi dengan logic yang disederhanakan
 */

(function($) {
    'use strict';

    class Validator {
        constructor() {
            this.rules = {
                name: {
                    minLength: 3,
                    maxLength: 101,
                    pattern: /^[a-zA-Z\s]+$/,  // Hanya huruf dan spasi
                    messages: {
                        required: 'Nama tidak boleh kosong',
                        minLength: 'Nama minimal 3 karakter',
                        maxLength: 'Nama maksimal 100 karakter',
                        pattern: 'Nama hanya boleh mengandung huruf dan spasi',
                        duplicate: 'Nama sudah ada'
                    }
                }
            };
            
            this.debounceTimer = null;
        }

        validateField(field, value, customRules = {}) {
            const rule = { ...this.rules[field], ...customRules };
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

        checkDuplicate(value, checkEndpoint, additionalData = {}) {
            return new Promise((resolve) => {
                if (this.debounceTimer) {
                    clearTimeout(this.debounceTimer);
                }

                this.debounceTimer = setTimeout(() => {
                    $.ajax({
                        url: irSettings.ajaxurl,
                        type: 'POST',
                        data: {
                            action: checkEndpoint,
                            name: value,
                            nonce: irSettings.nonce,
                            ...additionalData
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

        // Add method untuk custom rules
        addRule(field, rule) {
            this.rules[field] = { ...this.rules[field], ...rule };
        }
    }

    // Export validator
    window.irValidator = new Validator();

})(jQuery);
