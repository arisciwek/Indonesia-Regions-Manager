(function($) {
    'use strict';

    class BaseModal {
        constructor(modalId) {
            this.$modal = $(`#${modalId}`);
            this.$content = this.$modal.find('.ir-modal-content');
            this.$close = this.$modal.find('.ir-modal-close, #btnCancel');
            
            this.initializeEvents();
        }

        initializeEvents() {
            // Close modal events
            this.$close.on('click', () => this.hide());
            
            // Close on click outside
            this.$modal.on('click', (e) => {
                if (e.target === this.$modal[0]) {
                    this.hide();
                }
            });

            // Handle escape key
            $(document).on('keydown', (e) => {
                if (e.key === 'Escape' && this.isVisible()) {
                    this.hide();
                }
            });
        }

        show() {
            this.$modal.show();
            this.onShow();
        }

        hide() {
            this.$modal.hide();
            this.onHide();
        }

        isVisible() {
            return this.$modal.is(':visible');
        }

        // Hook methods to be overridden
        onShow() {}
        onHide() {}
    }

    // Export BaseModal
    window.irBaseModal = BaseModal;

})(jQuery);
