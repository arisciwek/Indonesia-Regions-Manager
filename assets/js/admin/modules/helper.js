(function($) {
    'use strict';

    const helper = {
        // Format date ke locale ID
        formatDate: function(dateString) {
            return new Date(dateString).toLocaleDateString('id-ID');
        },

        // Show toast message
        showToast: function(message, type = 'success') {
            const $toast = $('<div>')
                .addClass(`ir-toast ${type}`)
                .text(message)
                .appendTo('body')
                .fadeIn();

            setTimeout(() => {
                $toast.fadeOut(() => $toast.remove());
            }, 3000);
        },

        // Show/hide loading state
        loading: {
            show: function($element) {
                $element.find('.ir-loading').show();
                $element.find('.ir-content').hide();
            },
            hide: function($element) {
                $element.find('.ir-loading').hide();
                $element.find('.ir-content').show();
            }
        },

        // Handle form errors
        form: {
            showError: function($form, field, message) {
                const $field = $form.find(`#${field}`);
                const $error = $field.siblings('.ir-error-message');
                $field.addClass('error');
                $error.text(message).show();
            },
            
            clearErrors: function($form) {
                $form.find('.ir-error-message').hide().text('');
                $form.find('.error').removeClass('error');
            }
        },

        // URL handling
        getHashId: function() {
            const hash = window.location.hash;
            return hash ? parseInt(hash.replace('#', '')) : null;
        },

        setHashId: function(id) {
            window.location.hash = id || '';
        }
    };

    // Export helper module
    window.irHelper = helper;

})(jQuery);
