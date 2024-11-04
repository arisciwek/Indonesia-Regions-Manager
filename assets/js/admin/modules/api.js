(function($) {
    'use strict';

    const api = {
        // Basic AJAX request handler
        request: function(action, data = {}, method = 'POST') {
            return $.ajax({
                url: irSettings.ajaxurl,
                type: method,
                data: {
                    action: action,
                    nonce: irSettings.nonce,
                    ...data
                }
            });
        },

        // Province specific API calls
        province: {
            getAll: function(dtData) {
                return api.request('ir_get_provinces', {
                    ...dtData
                });
            },

            get: function(id) {
                return api.request('ir_get_province', {
                    id: id
                });
            },

            create: function(formData) {
                return api.request('ir_create_province', formData);
            },

            update: function(formData) {
                return api.request('ir_update_province', formData);
            },

            delete: function(id) {
                return api.request('ir_delete_province', {
                    id: id
                });
            },

            checkName: function(name, id = 0) {
                return api.request('ir_check_province_name', {
                    name: name,
                    id: id
                });
            }
        },

        // City specific API calls (untuk pengembangan nanti)
        city: {
            getAll: function(provinceId, dtData) {
                return api.request('ir_get_cities', {
                    province_id: provinceId,
                    ...dtData
                });
            },
            // ... methods lainnya untuk city
        }
    };

    // Export API module
    window.irAPI = api;

})(jQuery);
