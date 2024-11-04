(function($) {
    'use strict';

    class App {
        constructor() {
            this.initializeSettings();
            this.initializeGlobalEvents();
        }

        initializeSettings() {
            // Initialize toast with global settings
            if (typeof Toast !== 'undefined') {
                new Toast(irSettings.toast);
            }

            // Set DataTables defaults
            if ($.fn.dataTable) {
                $.extend(true, $.fn.dataTable.defaults, irSettings.dataTable);
            }

            // Set validator defaults
            if (typeof irValidator !== 'undefined' && irSettings.validation) {
                irValidator.addRule('name', irSettings.validation.rules.name);
            }
        }

        initializeGlobalEvents() {
            // Handle global AJAX errors
            $(document).ajaxError((event, jqXHR, settings, error) => {
                console.error('AJAX Error:', error);
                
                if (jqXHR.status === 403) {
                    irToast.error('Akses ditolak. Silakan muat ulang halaman.');
                } else if (jqXHR.status === 404) {
                    irToast.error('Data tidak ditemukan.');
                } else if (jqXHR.status === 500) {
                    irToast.error('Terjadi kesalahan sistem. Silakan coba lagi nanti.');
                } else {
                    irToast.error('Terjadi kesalahan. Silakan coba lagi.');
                }
            });

            // Handle global loading state
            $(document)
                .ajaxStart(() => {
                    $('body').addClass('ir-loading');
                })
                .ajaxStop(() => {
                    $('body').removeClass('ir-loading');
                });

            // Handle cache clearing on specific events
            if (typeof irConstants !== 'undefined' && typeof irCache !== 'undefined') {
                $(document).on(irConstants.EVENTS.PROVINCE.CREATED, () => {
                    irCache.clearCache();
                });
            }
        }

        // Initialize feature based on current page
        initializeFeature() {
            const $container = $(irConstants.SELECTORS.PROVINCE.CONTAINER);
            
            if ($container.length) {
                // Check if ProvinceManager is available
                if (typeof irProvinceManager !== 'undefined') {
                    window.provinceManager = new irProvinceManager();
                } else {
                    console.error('ProvinceManager not loaded. Please check script dependencies.');
                }
            }

            // Future: Add other feature initializations here
        }
    }

    // Initialize when document is ready and all scripts are loaded
    $(window).on('load', () => {
        window.app = new App();
        window.app.initializeFeature();
    });

})(jQuery);
