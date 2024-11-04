(function() {
    'use strict';

    const constants = {
        // Status codes
        STATUS: {
            SUCCESS: 'success',
            ERROR: 'error',
            WARNING: 'warning',
            INFO: 'info'
        },

        // Event names
        EVENTS: {
            PROVINCE: {
                CREATED: 'province:created',
                UPDATED: 'province:updated',
                DELETED: 'province:deleted',
                LOADED: 'province:loaded'
            },
            CITY: {
                CREATED: 'city:created',
                UPDATED: 'city:updated',
                DELETED: 'city:deleted',
                LOADED: 'city:loaded'
            }
        },

        // Cache keys
        CACHE_KEYS: {
            PROVINCE: 'provinces',
            CITY: 'cities'
        },

        // API endpoints
        ENDPOINTS: {
            PROVINCE: {
                LIST: 'ir_get_provinces',
                GET: 'ir_get_province',
                CREATE: 'ir_create_province',
                UPDATE: 'ir_update_province',
                DELETE: 'ir_delete_province',
                CHECK_NAME: 'ir_check_province_name'
            },
            CITY: {
                LIST: 'ir_get_cities',
                GET: 'ir_get_city',
                CREATE: 'ir_create_city',
                UPDATE: 'ir_update_city',
                DELETE: 'ir_delete_city',
                CHECK_NAME: 'ir_check_city_name'
            }
        },

        // DOM Selectors
        SELECTORS: {
            PROVINCE: {
                CONTAINER: '.ir-provinces-container',
                LIST: '.ir-provinces',
                DETAIL: '.ir-provinces-detail',
                TABLE: '#provincesTable',
                MODAL: '#provinceModal',
                ADD_BUTTON: '#btnAddProvince'
            },
            CITY: {
                CONTAINER: '.ir-cities-container',
                TABLE: '#citiesTable',
                MODAL: '#cityModal',
                ADD_BUTTON: '#btnAddCity'
            }
        }
    };

    // Export constants
    window.irConstants = constants;

})();
