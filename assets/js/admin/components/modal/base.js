/**
 * File: assets/js/admin/components/modal/base.js
 * Version: 1.0.2
 * Terakhir Diperbarui: 2024-11-19 19:00:00
 * Deskripsi: Komponen dasar modal dengan pengelolaan lifecycle dan event standar
 * 
 * Changelog:
 * v1.0.2 - 2024-11-19
 * - Implementasi lifecycle management yang lebih baik
 * - Perbaikan event handling dan cleanup
 * - Penambahan animasi modal
 * - Optimasi performa render
 * - Perbaikan aksesibilitas
 * - Penambahan metode utility
 * 
 * v1.0.1 - 2024-11-17
 * - Penambahan event hooks
 * - Perbaikan fokus management
 * - Optimasi DOM manipulation
 * 
 * v1.0.0 - 2024-11-15
 * - Initial release
 */

(function($) {
    'use strict';

    class BaseModal {
        constructor(modalId) {
            this.modalId = modalId;
            this.$modal = $(`#${modalId}`);
            
            // Cache selectors
            this.$content = this.$modal.find('.ir-modal-content');
            this.$close = this.$modal.find('.ir-modal-close, [data-action="close"]');
            
            // State management
            this.state = {
                isVisible: false,
                isAnimating: false,
                lastFocusedElement: null,
                zIndex: 100000
            };

            this.validateStructure();
            this.initializeEvents();
            this.setupAccessibility();
        }

        validateStructure() {
            if (!this.$modal.length) {
                console.error(`BaseModal: Modal with ID "${this.modalId}" not found`);
                throw new Error('Modal element not found');
            }

            if (!this.$content.length) {
                console.error('BaseModal: Modal content element not found');
                throw new Error('Modal content not found');
            }
        }

        initializeEvents() {
            // Cleanup existing events first
            this.cleanupEvents();

            // Close button click
            this.$close.on('click.baseModal', (e) => {
                e.preventDefault();
                this.hide();
            });
            
            // Close on backdrop click
            this.$modal.on('click.baseModal', (e) => {
                if (e.target === this.$modal[0]) {
                    this.hide();
                }
            });

            // Handle escape key
            $(document).on('keydown.baseModal', (e) => {
                if (e.key === 'Escape' && this.isVisible()) {
                    this.hide();
                }
            });

            // Prevent content click propagation
            this.$content.on('click.baseModal', (e) => {
                e.stopPropagation();
            });
        }

        setupAccessibility() {
            // ARIA attributes
            this.$modal.attr({
                'role': 'dialog',
                'aria-modal': 'true',
                'aria-labelledby': `${this.modalId}-title`,
                'aria-hidden': 'true'
            });

            // Trap focus within modal
            this.$modal.on('keydown.baseModal', (e) => {
                if (e.key === 'Tab') {
                    this.handleTabKey(e);
                }
            });
        }

        handleTabKey(e) {
            const focusableElements = this.getFocusableElements();
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }

        getFocusableElements() {
            return this.$modal
                .find('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
                .filter(':visible');
        }

        async show() {
            if (this.state.isVisible || this.state.isAnimating) return;

            try {
                this.state.isAnimating = true;
                this.state.lastFocusedElement = document.activeElement;

                // Before show hook
                await this.onBeforeShow();

                // Update state and attributes
                this.state.isVisible = true;
                this.$modal
                    .attr('aria-hidden', 'false')
                    .css('z-index', this.state.zIndex);

                // Show animation
                this.$modal.fadeIn(300, () => {
                    this.state.isAnimating = false;
                    this.onAfterShow();
                });

                // Prevent body scroll
                $('body').addClass('ir-modal-open');

            } catch (error) {
                console.error('BaseModal: Error showing modal', error);
                this.state.isAnimating = false;
            }
        }

        async hide() {
            if (!this.state.isVisible || this.state.isAnimating) return;

            try {
                this.state.isAnimating = true;

                // Before hide hook
                await this.onBeforeHide();

                // Hide animation
                this.$modal.fadeOut(200, () => {
                    this.state.isAnimating = false;
                    this.state.isVisible = false;
                    this.$modal.attr('aria-hidden', 'true');
                    this.onAfterHide();
                });

                // Restore body scroll
                $('body').removeClass('ir-modal-open');

                // Restore focus
                if (this.state.lastFocusedElement) {
                    this.state.lastFocusedElement.focus();
                }

            } catch (error) {
                console.error('BaseModal: Error hiding modal', error);
                this.state.isAnimating = false;
            }
        }

        isVisible() {
            return this.state.isVisible;
        }

        setTitle(title) {
            this.$modal.find(`#${this.modalId}-title`).text(title);
        }

        setContent(content) {
            this.$content.html(content);
        }

        destroy() {
            this.cleanupEvents();
            this.$modal.removeAttr('aria-hidden aria-modal role');
            this.state = null;
        }

        cleanupEvents() {
            this.$close.off('.baseModal');
            this.$modal.off('.baseModal');
            this.$content.off('.baseModal');
            $(document).off('keydown.baseModal');
        }

        // Lifecycle hooks - can be overridden by child classes
        async onBeforeShow() {}
        onAfterShow() {}
        async onBeforeHide() {}
        onAfterHide() {}
    }

    // Export BaseModal
    window.irBaseModal = BaseModal;

})(jQuery);