(function($) {
    'use strict';

    class TableActions {
        constructor(options = {}) {
            this.options = {
                onEdit: () => {},
                onDelete: () => {},
                onView: () => {},
                confirmDelete: irSettings.messages.confirmDelete,
                ...options
            };
        }

        renderActions(data) {
            return `
                <button type="button" class="button button-small edit-row" data-id="${data.id}">
                    Edit
                </button>
                <button type="button" class="button button-small button-link-delete delete-row" data-id="${data.id}">
                    Hapus
                </button>
            `;
        }

        attachEvents($container) {
            // Edit button handler
            $container.on('click', '.edit-row', (e) => {
                e.preventDefault();
                const id = $(e.currentTarget).data('id');
                this.options.onEdit(id);
            });

            // Delete button handler
            $container.on('click', '.delete-row', (e) => {
                e.preventDefault();
                const id = $(e.currentTarget).data('id');
                if (confirm(this.options.confirmDelete)) {
                    this.options.onDelete(id);
                }
            });

            // View handler (if link exists)
            $container.on('click', '.view-row', (e) => {
                e.preventDefault();
                const id = $(e.currentTarget).data('id');
                this.options.onView(id);
            });
        }
    }

    // Export TableActions
    window.irTableActions = TableActions;

})(jQuery);
