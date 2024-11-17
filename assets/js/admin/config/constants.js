/**
 * File: assets/js/admin/config/constants.js
 * Version: 1.1.0
 * 
 * Changelog:
 * - Add City endpoints with new naming convention
 * - Add City DOM selectors
 * - Add City cache keys
 */

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
                LIST: 'ir_city_get_all',
                GET: 'ir_city_get',
                CREATE: 'ir_city_create',
                UPDATE: 'ir_city_update',
                DELETE: 'ir_city_delete',
                CHECK_NAME: 'ir_city_check_name'
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
                LIST: '.ir-cities-list',
                DETAIL: '.ir-cities-detail',
                TABLE: '#citiesTable',
                MODAL: '#cityModal',
                ADD_BUTTON: '#btnAddCity',
                FORM: {
                    MAIN: '#cityForm',
                    NAME: '#cityName',
                    TYPE: '#cityType'
                },
                BUTTONS: {
                    SAVE: '#btnSaveCity',
                    CANCEL: '#btnCancelCity'
                },
                TABS: {
                    CONTAINER: '.ir-city-tabs',
                    CONTENT: '.ir-city-tab-content'
                }
            }
        },

        // Form Validation Rules
        VALIDATION: {
            CITY: {
                NAME: {
                    MIN_LENGTH: 3,
                    MAX_LENGTH: 100,
                    PATTERN: /^[a-zA-Z\s]+$/
                },
                TYPES: ['kabupaten', 'kota']
            }
        },

        // Messages
        MESSAGES: {
            CITY: {
                CONFIRM_DELETE: 'Apakah Anda yakin ingin menghapus kabupaten/kota ini?',
                NAME_REQUIRED: 'Nama kabupaten/kota tidak boleh kosong',
                TYPE_REQUIRED: 'Tipe harus dipilih',
                NAME_EXISTS: 'Nama kabupaten/kota sudah ada di provinsi ini',
                CREATE_SUCCESS: 'Kabupaten/Kota berhasil ditambahkan',
                UPDATE_SUCCESS: 'Kabupaten/Kota berhasil diupdate',
                DELETE_SUCCESS: 'Kabupaten/Kota berhasil dihapus',
                ERROR_LOADING: 'Gagal memuat data kabupaten/kota',
                ERROR_SAVING: 'Gagal menyimpan data'
            }
        },

        // Table Configurations
        TABLE: {
            CITY: {
                DEFAULT_ORDER: [[1, 'asc']],
                COLUMNS: [
                    { data: 'id' },
                    { data: 'name' },
                    { data: 'type' },
                    { data: 'created_at' }
                ]
            }
        }
    };

    // Export constants
    window.irConstants = constants;

})();