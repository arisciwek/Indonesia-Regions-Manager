/**
 * File: assets/js/admin/components/table/actions.js
 * Version: 1.0.2
 * Terakhir Diperbarui: 2024-11-19 20:00:00
 * Deskripsi: Komponen pengelola aksi tabel (edit, delete, view) dengan integrasi state management
 * 
 * Changelog:
 * v1.0.2 - 2024-11-19
 * - Integrasi dengan sistem state management terpusat
 * - Penyempurnaan render action buttons
 * - Penambahan sistem permission check
 * - Optimasi event delegation
 * - Penambahan validasi aksi
 * - Perbaikan penanganan error
 * 
 * v1.0.1 - 2024-11-17
 * - Penghapusan konfirmasi ganda
 * - Restrukturisasi handler delete
 * - Perbaikan error handling
 * - Optimasi kode
 */

(function($) {
    'use strict';

    class TableActions {
        constructor(options = {}) {
            this.options = {
                onEdit: () => {},
                onDelete: () => {},
                onView: () => {},
                permissions: {
                    canEdit: true,
                    canDelete: true,
                    canView: true
                },
                confirmDelete: true,
                buttonClasses: {
                    edit: 'button button-small',
                    delete: 'button button-small button-link-delete',
                    view: 'button button-small'
                },
                icons: {
                    edit: 'dashicons dashicons-edit',
                    delete: 'dashicons dashicons-trash',
                    view: 'dashicons dashicons-visibility'
                },
                ...options
            };

            this.state = {
                isProcessing: false,
                lastAction: null,
                lastItemId: null
            };
        }

        /**
         * Render action buttons dengan permission check
         */
        renderActions(data) {
            const buttons = [];

            if (this.options.permissions.canView) {
                buttons.push(this.renderButton('view', data.id, 'Lihat'));
            }

            if (this.options.permissions.canEdit) {
                buttons.push(this.renderButton('edit', data.id, 'Edit'));
            }

            if (this.options.permissions.canDelete && this.canDelete(data)) {
                buttons.push(this.renderButton('delete', data.id, 'Hapus'));
            }

            return `<div class="ir-table-actions">${buttons.join('')}</div>`;
        }

        /**
         * Render single button dengan proper attributes
         */
        renderButton(action, id, label) {
            const icon = this.options.icons[action];
            const className = this.options.buttonClasses[action];
            
            return `
                <button type="button" 
                    class="${className} ${action}-row" 
                    data-id="${id}" 
                    data-action="${action}"
                    title="${label}">
                    ${icon ? `<span class="${icon}"></span>` : ''}
                    ${label}
                </button>
            `;
        }

        /**
         * Check if item can be deleted based on data
         */
        canDelete(data) {
            // Override dengan logic spesifik jika diperlukan
            return true;
        }

        /**
         * Attach event handlers dengan proper delegation
         */
        attachEvents($container) {
            console.log('TableActions: Attaching events to container');
            
            // Cleanup existing events first
            this.cleanupEvents($container);

            // Delegate events untuk semua action buttons
            $container.on('click.tableActions', '.ir-table-actions button', (e) => {
                e.preventDefault();
                
                const $button = $(e.currentTarget);
                const action = $button.data('action');
                const id = $button.data('id');

                console.log('TableActions: Button clicked', { action, id });

                if (action && id) {
                    this.handleAction(action, id, $button);
                }
            });
        }

        /**
         * Handle semua action dengan validasi
         */
        async handleAction(action, id, $button) {
            console.log('TableActions: Handling action', { action, id });

            try {
                this.state.isProcessing = true;
                this.state.lastAction = action;
                this.state.lastItemId = id;

                // Show loading state
                this.showLoading($button);

                switch (action) {
                    case 'edit':
                        await this.handleEdit(id);
                        break;
                    case 'delete':
                        await this.handleDelete(id);
                        break;
                    default:
                        console.warn('TableActions: Unknown action', action);
                }

            } catch (error) {
                this.handleError(error, action, id);
            } finally {
                this.hideLoading($button);
                this.state.isProcessing = false;
            }
        }

        /**
         * Handle edit action
         */
        async handleEdit(id) {
            if (!this.options.permissions.canEdit) {
                throw new Error('Tidak memiliki izin untuk mengedit');
            }

            await this.options.onEdit(id);
        }

        /**
         * Handle delete action dengan konfirmasi
         */
        async handleDelete(id) {
            console.log('TableActions: Delete action for ID', id);

            if (!this.options.permissions.canDelete) {
                console.warn('TableActions: Delete not permitted');
                throw new Error('Tidak memiliki izin untuk menghapus');
            }

            if (typeof this.options.onDelete === 'function') {
                await this.options.onDelete(id);
            } else {
                console.warn('TableActions: No delete handler provided');
            }
        }

        /**
         * Handle view action
         */
        async handleView(id) {
            if (!this.options.permissions.canView) {
                throw new Error('Tidak memiliki izin untuk melihat');
            }

            await this.options.onView(id);
        }

        /**
         * Show loading state pada button
         */
        showLoading($button) {
            const originalHtml = $button.html();
            $button
                .data('original-html', originalHtml)
                .prop('disabled', true)
                .html('<span class="spinner is-active"></span>');
        }

        /**
         * Hide loading state pada button
         */
        hideLoading($button) {
            const originalHtml = $button.data('original-html');
            if (originalHtml) {
                $button
                    .html(originalHtml)
                    .prop('disabled', false)
                    .removeData('original-html');
            }
        }

        /**
         * Handle error dengan proper feedback
         */
        handleError(error, action, id) {
            console.error(`[TableActions] Error during ${action}:`, error);

            let message = 'Terjadi kesalahan sistem';
            if (error.message) {
                message = error.message;
            }

            irToast.error(message);
        }

        /**
         * Cleanup events dan resources
         */
        cleanupEvents($container) {
            $container.off('.tableActions');
        }

        /**
         * Destroy instance dan cleanup
         */
        destroy() {
            this.state = null;
            this.options = null;
        }
    }

    // Export TableActions
    window.irTableActions = TableActions;

})(jQuery);
