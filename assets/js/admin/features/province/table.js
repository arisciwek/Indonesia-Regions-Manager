(function($) {
    'use strict';

    class ProvinceTable extends irBaseTable {
        constructor() {
            // Define configuration before calling super
            const tableConfig = {
                ajax: {
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: function(d) {
                        return {
                            ...d,
                            action: 'ir_get_provinces',
                            nonce: irSettings.nonce
                        };
                    }
                },
                columns: [
                    { data: 'id' },
                    { 
                        data: 'name',
                        render: function(data, type, row) {
                            if (type === 'display') {
                                return `<a href="#${row.id}" class="province-link">${data}</a>`;
                            }
                            return data;
                        }
                    },
                    { 
                        data: 'total_cities',
                        searchable: false
                    },
                    { 
                        data: 'created_at',
                        render: function(data) {
                            return irHelper.formatDate(data);
                        }
                    },
                    {
                        data: null,
                        orderable: false,
                        searchable: false,
                        render: function(data) {
                            const actions = new irTableActions({
                                onEdit: () => {},
                                onDelete: () => {}
                            });
                            return actions.renderActions(data);
                        }
                    }
                ],
                order: [[1, 'asc']]
            };

            // Call super with configuration
            super('provincesTable', tableConfig);

            // Initialize table actions after super
            this.actions = new irTableActions({
                onEdit: (id) => this.handleEdit(id),
                onDelete: (id) => this.handleDelete(id)
            });

            // Initialize events after everything is set up
            this.initializeEvents();
        }

        initializeEvents() {
            // Handle province link clicks
            this.$table.on('click', '.province-link', (e) => {
                e.preventDefault();
                const href = $(e.currentTarget).attr('href');
                if (href) {
                    window.location.hash = href.replace('#', '');
                }
            });

            // Attach action events only if actions is properly initialized
            if (this.actions && typeof this.actions.attachEvents === 'function') {
                this.actions.attachEvents(this.$table);
            }
        }

        // Handler methods that will be overridden
        handleEdit(id) {
            if (typeof this.onEdit === 'function') {
                this.onEdit(id);
            }
        }

        handleDelete(id) {
            if (typeof this.onDelete === 'function') {
                this.onDelete(id);
            }
        }

        // Callback methods to be overridden by province manager
        onEdit() {}
        onDelete() {}

        // Public method to set callbacks
        setCallbacks(callbacks = {}) {
            if (typeof callbacks.onEdit === 'function') {
                this.onEdit = callbacks.onEdit;
            }
            if (typeof callbacks.onDelete === 'function') {
                this.onDelete = callbacks.onDelete;
            }
        }
    }

    // Export ProvinceTable
    window.irProvinceTable = ProvinceTable;

})(jQuery);