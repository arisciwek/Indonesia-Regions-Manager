/**
 * File: assets/js/admin/modules/validator.js
 * Version: 1.0.1
 * Last Updated: 2024-11-20 12:00:00
 * 
 * Changelog v1.0.1:
 * - Fix: Name pattern to allow more characters
 * - Add: Debug logging for validation process
 * - Fix: Debounce time for name checking
 */

(function($) {
    'use strict';

    class Validator {
        constructor() {
            this.rules = {
                name: {
                    minLength: 3,
                    maxLength: 100,
                    pattern: /^[a-zA-Z0-9\s]+$/, // Allow letters, numbers, spaces
                    messages: {
                        required: 'Nama tidak boleh kosong',
                        minLength: 'Nama minimal 3 karakter',
                        maxLength: 'Nama maksimal 100 karakter',
                        pattern: 'Nama hanya boleh mengandung huruf, angka dan spasi',
                        duplicate: 'Nama sudah ada'
                    }
                }
            };
            
            this.debounceTimer = null;
        }

        validateField(field, value, customRules = {}) {
            console.log('Validator: Validating field:', field, 'value:', value);
            
            const rule = { ...this.rules[field], ...customRules };
            if (!rule) return { valid: true };

            // Trim value
            value = String(value || '').trim();

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
                            name: value?.trim(),
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
                }, 500);
            });
        }

        addRule(field, rule) {
            this.rules[field] = { ...this.rules[field], ...rule };
        }
    }

    window.irValidator = new Validator();

})(jQuery);
