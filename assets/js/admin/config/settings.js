(function() {
    'use strict';

    // Extend irSettings dari WordPress
    const settings = {
        ...window.irSettings,
        
        // Default DataTables settings
        dataTable: {
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
            }
        },

        // Toast notification settings
        toast: {
            duration: 3000,
            position: 'bottom-right'
        },

        // Form validation settings
        validation: {
            debounceTime: 500,
            rules: {
                name: {
                    minLength: 3,
                    maxLength: 100,
                    pattern: /^[a-zA-Z\s]+$/
                }
            }
        },

        // Cache settings
        cache: {
            enabled: true,
            prefix: 'ir_'
        },

        // Modal settings
        modal: {
            animation: true,
            closeOnEscape: true,
            closeOnClickOutside: true
        }
    };

    // Export settings
    window.irSettings = settings;

})();
