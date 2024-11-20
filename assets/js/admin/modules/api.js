/**
 * File: assets/js/admin/modules/api.js
 * Version: 1.0.1
 * Description: API module untuk handle AJAX requests
 * 
 * Changelog:
 * - v1.0.1: Menambahkan city API endpoints
 * - v1.0.0: Initial release dengan province endpoints
 */

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

        // City specific API calls 
        city: {
            getAll: function(provinceId, dtData) {
                return api.request(irConstants.ENDPOINTS.CITY.LIST, {
                    province_id: provinceId,
                    ...dtData
                });
            },

            get: function(id) {
                return api.request(irConstants.ENDPOINTS.CITY.GET, {
                    id: id
                });
            },

            create: function(formData) {
                return api.request(irConstants.ENDPOINTS.CITY.CREATE, formData);
            },

            update: function(formData) {
                return api.request(irConstants.ENDPOINTS.CITY.UPDATE, formData);
            },

            delete: function(id) {
                return api.request(irConstants.ENDPOINTS.CITY.DELETE, {
                    id: id
                });
            },

            checkName: function(name, provinceId, id = 0) {
                return api.request(irConstants.ENDPOINTS.CITY.CHECK_NAME, {
                    name: name,
                    province_id: provinceId,
                    id: id
                });
            },

            // Method khusus untuk mendapatkan data tipe kota/kabupaten
            getTypes: function() {
                return irConstants.VALIDATION.CITY.TYPES;
            }
        }
    };

    // Export API module
    window.irAPI = api;

})(jQuery);