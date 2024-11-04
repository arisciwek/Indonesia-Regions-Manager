(function($) {
    'use strict';

    class Toast {
        constructor(options = {}) {
            this.options = {
                duration: 3000,
                position: 'bottom-right',
                ...options
            };
        }

        show(message, type = 'success') {
            const $toast = $('<div>')
                .addClass(`ir-toast ${type}`)
                .text(message)
                .appendTo('body');

            $toast.fadeIn();

            setTimeout(() => {
                $toast.fadeOut(() => $toast.remove());
            }, this.options.duration);
        }

        success(message) {
            this.show(message, 'success');
        }

        error(message) {
            this.show(message, 'error');
        }

        info(message) {
            this.show(message, 'info');
        }

        warning(message) {
            this.show(message, 'warning');
        }
    }

    // Export Toast class first
    window.Toast = Toast;

    // Then create instance
    if (!window.irToast) {
        window.irToast = new Toast(window.irSettings?.toast || {});
    }

})(jQuery);
