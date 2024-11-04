(function($) {
    'use strict';

    class BaseTable {
        constructor(tableId, options = {}) {
            this.tableId = tableId;
            this.$table = $(`#${tableId}`);
            
            this.options = {
                processing: true,
                serverSide: true,
                language: {
                    processing: 'Memproses...',
                    lengthMenu: 'Tampilkan _MENU_ data per halaman',
                    zeroRecords: 'Data tidak ditemukan',
                    info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ data',
                    infoEmpty: 'Menampilkan 0 sampai 0 dari 0 data',
                    infoFiltered: '(difilter dari _MAX_ total data)',
                    search: 'Cari:',
                    paginate: {
                        first: 'Pertama',
                        last: 'Terakhir',
                        next: 'Selanjutnya',
                        previous: 'Sebelumnya'
                    }
                },
                ...options
            };

            this.initialize();
        }

        initialize() {
            this.datatable = this.$table.DataTable(this.options);
            this.initializeEvents();
        }

        initializeEvents() {
            // Implementasi spesifik di child class
        }

        reload() {
            this.datatable.ajax.reload(null, false);
        }

        destroy() {
            if (this.datatable) {
                this.datatable.destroy();
            }
        }

        addRow(data) {
            this.datatable.row.add(data).draw(false);
        }

        updateRow(rowId, data) {
            const row = this.datatable.row(`#${rowId}`);
            if (row.length) {
                row.data(data).draw(false);
            }
        }

        deleteRow(rowId) {
            const row = this.datatable.row(`#${rowId}`);
            if (row.length) {
                row.remove().draw(false);
            }
        }

        clear() {
            this.datatable.clear().draw();
        }
    }

    // Export BaseTable
    window.irBaseTable = BaseTable;

})(jQuery);
